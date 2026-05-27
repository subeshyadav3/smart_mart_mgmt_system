import { randomUUID } from "node:crypto";
import prisma from "../../config/db.js";
import AppError from "../../utils/apiError.js";

const LOYALTY_POINT_RATE = 100;

const BILL_STATUS = {
  COMPLETED: "COMPLETED",
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
};

const PAYMENT_METHODS = new Set(["CASH", "CARD", "DIGITAL_WALLET"]);
const BILL_INCLUDE = {
  billItems: {
    include: {
      product: true,
    },
  },
  member: true,
  createdBy: true,
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_PAGE_LIMIT = 100;

const parseNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeStatus = (value) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return Object.values(BILL_STATUS).includes(normalized) ? normalized : null;
};

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toDecimalString = (value) => parseNumber(value).toString();

const buildBillNumber = () => `BILL-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

const buildBillResponse = (bill) => {
  if (!bill) return null;

  return {
    ...bill,
    items: bill.billItems ?? [],
    customer: bill.member ?? null,
    cashier: bill.createdBy ?? null,
  };
};

const getMemberId = (payload) => payload.memberId || payload.customerId || null;

const validateCreatePayload = ({ items, cashierId, paymentMethod }) => {
  if (!cashierId) {
    throw new AppError("Cashier is required", 400);
  }

  if (!paymentMethod) {
    throw new AppError("Payment method is required", 400);
  }

  if (!PAYMENT_METHODS.has(paymentMethod)) {
    throw new AppError("Invalid payment method", 400);
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Sale items are required", 400);
  }
};

const calculateLineTotals = (product, item) => {
  const quantity = parseNumber(item.quantity);
  const unitPrice = parseNumber(product.sellingPrice);
  const discountPercent = parseNumber(item.discountPercent);
  const lineSubtotal = unitPrice * quantity;
  const lineDiscount = lineSubtotal * (discountPercent / 100);
  const lineTotal = lineSubtotal - lineDiscount;

  return {
    quantity,
    unitPrice,
    discountPercent,
    lineSubtotal,
    lineDiscount,
    lineTotal,
  };
};

const getBillById = async (id, tx = prisma) =>
  tx.bill.findUnique({
    where: { id },
    include: BILL_INCLUDE,
  });

const assertBillExists = (bill) => {
  if (!bill) {
    throw new AppError("Sale not found", 404);
  }
};

const restoreInventoryForCancelledBill = async (tx, bill) => {
  if (bill.status !== BILL_STATUS.COMPLETED) return;

  for (const item of bill.billItems) {
    const previousStock = item.product.stockQuantity;
    const newStock = previousStock + item.quantity;

    await tx.product.update({
      where: { id: item.product.id },
      data: {
        stockQuantity: newStock,
        status: newStock <= 0 ? "OUT_OF_STOCK" : "ACTIVE",
      },
    });

    await tx.inventoryLog.create({
      data: {
        productId: item.product.id,
        updatedById: bill.createdById,
        previousStock,
        newStock,
        changeAmount: item.quantity,
        reason: `Sale cancelled: ${bill.billNumber}`,
      },
    });
  }

  if (bill.memberId) {
    const loyaltyPoints = Math.floor(parseNumber(bill.finalAmount) / LOYALTY_POINT_RATE);
    await tx.member.update({
      where: { id: bill.memberId },
      data: {
        loyaltyPoints: { decrement: loyaltyPoints },
        totalSpent: { decrement: bill.finalAmount },
      },
    });
  }
};

export const createSale = async (payload) => {
  const { items, cashierId, paymentMethod, status = BILL_STATUS.COMPLETED } = payload;
  const memberId = getMemberId(payload);
  const normalizedStatus = normalizeStatus(status) || BILL_STATUS.COMPLETED;

  validateCreatePayload({ items, cashierId, paymentMethod });

  if (![BILL_STATUS.COMPLETED, BILL_STATUS.PENDING].includes(normalizedStatus)) {
    throw new AppError("Invalid bill status", 400);
  }

  const productIds = [...new Set(items.map((item) => item.productId).filter(Boolean))];
  if (productIds.length !== items.length) {
    throw new AppError("Each sale item must include a valid productId", 400);
  }

  const [products, member, cashier] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds } },
    }),
    memberId
      ? prisma.member.findUnique({
          where: { id: memberId },
        })
      : Promise.resolve(null),
    prisma.staff.findUnique({
      where: { id: cashierId },
    }),
  ]);

  if (!cashier) {
    throw new AppError("Cashier not found", 404);
  }

  if (memberId && !member) {
    throw new AppError("Member not found", 404);
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  const missingProducts = productIds.filter((productId) => !productMap.has(productId));
  if (missingProducts.length > 0) {
    throw new AppError("Invalid product(s) in sale", 400);
  }

  const inactiveProducts = products.filter((product) => product.status !== "ACTIVE");
  if (inactiveProducts.length > 0) {
    throw new AppError("One or more products are not available for sale", 400);
  }

  const stockIssues = items.filter((item) => {
    const product = productMap.get(item.productId);
    const quantity = parseNumber(item.quantity);
    return quantity <= 0 || product.stockQuantity < quantity;
  });

  if (stockIssues.length > 0) {
    throw new AppError("Insufficient stock for one or more products", 400);
  }

  const normalizedItems = items.map((item) => {
    const product = productMap.get(item.productId);
    const pricing = calculateLineTotals(product, item);

    return {
      product,
      ...pricing,
    };
  });

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineSubtotal, 0);
  const itemDiscountTotal = normalizedItems.reduce((sum, item) => sum + item.lineDiscount, 0);
  const billDiscount = parseNumber(payload.totalDiscount);
  const totalDiscount = Math.max(0, itemDiscountTotal + billDiscount);
  const finalAmount = Math.max(0, subtotal - totalDiscount);
  const loyaltyPointsEarned = memberId ? Math.floor(finalAmount / LOYALTY_POINT_RATE) : 0;
  const billNumber = buildBillNumber();

  const bill = await prisma.$transaction(async (tx) => {
    const createdBill = await tx.bill.create({
      data: {
        billNumber,
        createdById: cashierId,
        memberId,
        subtotal: toDecimalString(subtotal),
        totalDiscount: toDecimalString(totalDiscount),
        finalAmount: toDecimalString(finalAmount),
        status: normalizedStatus,
        paymentMethod,
      },
    });

    if (normalizedStatus === BILL_STATUS.COMPLETED) {
      for (const item of normalizedItems) {
        const previousStock = item.product.stockQuantity;
        const newStock = previousStock - item.quantity;

        await tx.billItem.create({
          data: {
            billId: createdBill.id,
            productId: item.product.id,
            quantity: item.quantity,
            productPrice: toDecimalString(item.unitPrice),
            discountPercent: item.discountPercent,
            totalPrice: toDecimalString(item.lineTotal),
          },
        });

        await tx.product.update({
          where: { id: item.product.id },
          data: {
            stockQuantity: newStock,
            status: newStock <= 0 ? "OUT_OF_STOCK" : "ACTIVE",
          },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.product.id,
            updatedById: cashierId,
            previousStock,
            newStock,
            changeAmount: -item.quantity,
            reason: `Sale bill ${billNumber}`,
          },
        });
      }

      if (memberId) {
        await tx.member.update({
          where: { id: memberId },
          data: {
            loyaltyPoints: {
              increment: loyaltyPointsEarned,
            },
            totalSpent: {
              increment: finalAmount,
            },
          },
        });
      }
    } else {
      for (const item of normalizedItems) {
        await tx.billItem.create({
          data: {
            billId: createdBill.id,
            productId: item.product.id,
            quantity: item.quantity,
            productPrice: toDecimalString(item.unitPrice),
            discountPercent: item.discountPercent,
            totalPrice: toDecimalString(item.lineTotal),
          },
        });
      }
    }

    return getBillById(createdBill.id, tx);
  });

  return {
    success: true,
    statusCode: 201,
    message: normalizedStatus === BILL_STATUS.COMPLETED ? "Sale created" : "Bill created",
    data: {
      ...buildBillResponse(bill),
      loyaltyPointsEarned,
    },
  };
};

export const listSales = async (query = {}) => {
  const {
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    memberId,
    customerId,
    cashierId,
    status,
    search,
    startDate,
    endDate,
  } = query;

  const safePage = parsePositiveInt(page, DEFAULT_PAGE);
  const safeLimit = Math.min(parsePositiveInt(limit, DEFAULT_LIMIT), MAX_PAGE_LIMIT);
  const skip = (safePage - 1) * safeLimit;
  const resolvedMemberId = memberId || customerId;
  const normalizedStatus = normalizeStatus(status);
  const parsedStartDate = parseDate(startDate);
  const parsedEndDate = parseDate(endDate);

  const where = {};
  if (resolvedMemberId) where.memberId = resolvedMemberId;
  if (cashierId) where.createdById = cashierId;
  if (normalizedStatus) where.status = normalizedStatus;

  if (search) {
    where.OR = [
      { billNumber: { contains: search, mode: "insensitive" } },
      { member: { fullName: { contains: search, mode: "insensitive" } } },
      { member: { phoneNumber: { contains: search, mode: "insensitive" } } },
      { createdBy: { fullName: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (parsedStartDate || parsedEndDate) {
    where.createdAt = {};
    if (parsedStartDate) where.createdAt.gte = parsedStartDate;
    if (parsedEndDate) where.createdAt.lte = parsedEndDate;
  }

  const [data, total] = await Promise.all([
    prisma.bill.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
      include: BILL_INCLUDE,
    }),
    prisma.bill.count({ where }),
  ]);

  return {
    success: true,
    statusCode: 200,
    data: data.map(buildBillResponse),
    meta: { total, page: safePage, limit: safeLimit },
  };
};

export const getSaleById = async (id) => {
  const bill = await getBillById(id);
  assertBillExists(bill);

  return {
    success: true,
    statusCode: 200,
    data: buildBillResponse(bill),
  };
};

export const getInvoice = async (id) => {
  const bill = await getBillById(id);
  assertBillExists(bill);

  const invoice = {
    invoiceNumber: bill.billNumber,
    date: bill.createdAt,
    customer: bill.member,
    cashier: bill.createdBy,
    items: bill.billItems.map((item) => ({
      name: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.productPrice,
      discountPercent: item.discountPercent,
      total: item.totalPrice,
    })),
    subtotal: bill.subtotal,
    totalDiscount: bill.totalDiscount,
    totalAmount: bill.finalAmount,
    status: bill.status,
    paymentMethod: bill.paymentMethod,
  };

  return {
    success: true,
    statusCode: 200,
    data: invoice,
  };
};

export const cancelSale = async (id) => {
  const bill = await getBillById(id);
  assertBillExists(bill);

  if (bill.status === BILL_STATUS.CANCELLED) {
    throw new AppError("Sale is already cancelled", 400);
  }

  const updatedBill = await prisma.$transaction(async (tx) => {
    await restoreInventoryForCancelledBill(tx, bill);

    return tx.bill.update({
      where: { id },
      data: { status: BILL_STATUS.CANCELLED },
      include: BILL_INCLUDE,
    });
  });

  return {
    success: true,
    statusCode: 200,
    message: "Sale cancelled",
    data: buildBillResponse(updatedBill),
  };
};
