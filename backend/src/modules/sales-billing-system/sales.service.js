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
const SALE_EDIT_WINDOW_MS = 60 * 1000;

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

  const createdAtMs = new Date(bill.createdAt).getTime();
  const editableUntil = new Date(createdAtMs + SALE_EDIT_WINDOW_MS);
  const canEdit = bill.status !== BILL_STATUS.CANCELLED && Date.now() <= editableUntil.getTime();

  return {
    ...bill,
    items: bill.billItems ?? [],
    customer: bill.member ?? null,
    cashier: bill.createdBy ?? null,
    canEdit,
    editableUntil: editableUntil.toISOString(),
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

const restoreInventoryForBillItems = async (tx, bill, reasonPrefix = "Sale adjusted") => {
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
        reason: `${reasonPrefix}: ${bill.billNumber}`,
      },
    });
  }
};

const applyInventoryForItems = async (tx, billNumber, cashierId, normalizedItems, reasonPrefix = "Sale adjusted") => {
  for (const item of normalizedItems) {
    const freshProduct = await tx.product.findUnique({ where: { id: item.product.id } });
    if (!freshProduct || freshProduct.stockQuantity < item.quantity) {
      throw new AppError(`Insufficient stock for product ${item.product.name}`, 400);
    }

    const previousStock = freshProduct.stockQuantity;
    const newStock = previousStock - item.quantity;

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
        reason: `${reasonPrefix}: ${billNumber}`,
      },
    });
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

const rollbackMemberImpactForCompletedBill = async (tx, bill) => {
  if (bill.status !== BILL_STATUS.COMPLETED || !bill.memberId) return;
  const loyaltyPoints = Math.floor(parseNumber(bill.finalAmount) / LOYALTY_POINT_RATE);
  await tx.member.update({
    where: { id: bill.memberId },
    data: {
      loyaltyPoints: { decrement: loyaltyPoints },
      totalSpent: { decrement: bill.finalAmount },
    },
  });
};

const applyMemberImpactForCompletedBill = async (tx, memberId, finalAmount) => {
  if (!memberId) return;
  const loyaltyPoints = Math.floor(parseNumber(finalAmount) / LOYALTY_POINT_RATE);
  await tx.member.update({
    where: { id: memberId },
    data: {
      loyaltyPoints: { increment: loyaltyPoints },
      totalSpent: { increment: finalAmount },
    },
  });
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

export const updateSale = async (id, payload = {}, updatedById) => {
  const existingBill = await getBillById(id);
  assertBillExists(existingBill);

  const billAgeMs = Date.now() - new Date(existingBill.createdAt).getTime();
  if (billAgeMs > SALE_EDIT_WINDOW_MS) {
    throw new AppError("Sale can only be edited within 1 minute of creation", 400);
  }

  if (existingBill.status === BILL_STATUS.CANCELLED) {
    throw new AppError("Cancelled sales cannot be edited", 400);
  }

  const nextItems = payload.items;
  if (!Array.isArray(nextItems) || nextItems.length === 0) {
    throw new AppError("Updated sale items are required", 400);
  }

  const nextPaymentMethod = payload.paymentMethod || existingBill.paymentMethod;
  if (!PAYMENT_METHODS.has(nextPaymentMethod)) {
    throw new AppError("Invalid payment method", 400);
  }

  const nextStatus = normalizeStatus(payload.status) || existingBill.status;
  if (![BILL_STATUS.COMPLETED, BILL_STATUS.PENDING].includes(nextStatus)) {
    throw new AppError("Invalid bill status", 400);
  }

  const nextMemberId = payload.memberId === undefined ? existingBill.memberId : payload.memberId || null;
  const productIds = [...new Set(nextItems.map((item) => item.productId).filter(Boolean))];
  if (productIds.length !== nextItems.length) {
    throw new AppError("Each sale item must include a valid productId", 400);
  }

  const [products, member] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: productIds } } }),
    nextMemberId ? prisma.member.findUnique({ where: { id: nextMemberId } }) : Promise.resolve(null),
  ]);

  if (nextMemberId && !member) {
    throw new AppError("Member not found", 404);
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const missingProducts = productIds.filter((productId) => !productMap.has(productId));
  if (missingProducts.length > 0) {
    throw new AppError("Invalid product(s) in sale", 400);
  }

  const normalizedItems = nextItems.map((item) => {
    const product = productMap.get(item.productId);
    return {
      product,
      ...calculateLineTotals(product, item),
    };
  });

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineSubtotal, 0);
  const itemDiscountTotal = normalizedItems.reduce((sum, item) => sum + item.lineDiscount, 0);
  const billDiscount = parseNumber(payload.totalDiscount);
  const totalDiscount = Math.max(0, itemDiscountTotal + billDiscount);
  const finalAmount = Math.max(0, subtotal - totalDiscount);

  const previousSnapshot = {
    billNumber: existingBill.billNumber,
    subtotal: existingBill.subtotal,
    totalDiscount: existingBill.totalDiscount,
    finalAmount: existingBill.finalAmount,
    status: existingBill.status,
    paymentMethod: existingBill.paymentMethod,
    itemCount: existingBill.billItems.length,
  };

  const updatedBill = await prisma.$transaction(async (tx) => {
    if (existingBill.status === BILL_STATUS.COMPLETED) {
      await restoreInventoryForBillItems(tx, existingBill, "Sale edit rollback");
      await rollbackMemberImpactForCompletedBill(tx, existingBill);
    }

    await tx.billItem.deleteMany({ where: { billId: existingBill.id } });

    const bill = await tx.bill.update({
      where: { id: existingBill.id },
      data: {
        memberId: nextMemberId,
        subtotal: toDecimalString(subtotal),
        totalDiscount: toDecimalString(totalDiscount),
        finalAmount: toDecimalString(finalAmount),
        paymentMethod: nextPaymentMethod,
        status: nextStatus,
      },
      include: BILL_INCLUDE,
    });

    for (const item of normalizedItems) {
      await tx.billItem.create({
        data: {
          billId: bill.id,
          productId: item.product.id,
          quantity: item.quantity,
          productPrice: toDecimalString(item.unitPrice),
          discountPercent: item.discountPercent,
          totalPrice: toDecimalString(item.lineTotal),
        },
      });
    }

    if (nextStatus === BILL_STATUS.COMPLETED) {
      await applyInventoryForItems(tx, bill.billNumber, updatedById || existingBill.createdById, normalizedItems, "Sale edit applied");
      await applyMemberImpactForCompletedBill(tx, nextMemberId, finalAmount);
    }

    return getBillById(bill.id, tx);
  });

  const auditNote = {
    editedAt: new Date().toISOString(),
    editedById: updatedById || existingBill.createdById,
    previous: previousSnapshot,
    current: {
      subtotal: updatedBill.subtotal,
      totalDiscount: updatedBill.totalDiscount,
      finalAmount: updatedBill.finalAmount,
      status: updatedBill.status,
      paymentMethod: updatedBill.paymentMethod,
      itemCount: updatedBill.billItems.length,
    },
  };

  return {
    success: true,
    statusCode: 200,
    message: "Sale updated",
    data: {
      ...buildBillResponse(updatedBill),
      auditNote,
    },
  };
};

export const getSaleAuditTrail = async (id) => {
  const bill = await getBillById(id);
  assertBillExists(bill);

  const logs = await prisma.inventoryLog.findMany({
    where: {
      reason: {
        contains: bill.billNumber,
        mode: "insensitive",
      },
    },
    include: {
      updatedBy: true,
      product: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return {
    success: true,
    statusCode: 200,
    data: logs.map((log) => ({
      id: log.id,
      createdAt: log.createdAt,
      reason: log.reason,
      previousStock: log.previousStock,
      newStock: log.newStock,
      changeAmount: log.changeAmount,
      updatedBy: log.updatedBy
        ? { id: log.updatedBy.id, fullName: log.updatedBy.fullName, role: log.updatedBy.role }
        : null,
      product: log.product
        ? { id: log.product.id, name: log.product.name, sku: log.product.sku }
        : null,
    })),
  };
};

export const getSalesAnalytics = async ({ staffId, days = 30 } = {}) => {
  const periodDays = Math.max(7, Math.min(parsePositiveInt(days, 30), 365));
  const since = new Date();
  since.setDate(since.getDate() - periodDays);

  const where = {
    createdAt: { gte: since },
    status: BILL_STATUS.COMPLETED,
    ...(staffId ? { createdById: staffId } : {}),
  };

  const [sales, topMembersRaw, stockActions] = await Promise.all([
    prisma.bill.findMany({
      where,
      include: BILL_INCLUDE,
      orderBy: { createdAt: "asc" },
    }),
    prisma.bill.groupBy({
      by: ["memberId"],
      where: {
        ...where,
        memberId: { not: null },
      },
      _sum: { finalAmount: true },
      _count: { _all: true },
      orderBy: {
        _sum: { finalAmount: "desc" },
      },
      take: 5,
    }),
    staffId
      ? prisma.inventoryLog.count({ where: { updatedById: staffId, createdAt: { gte: since } } })
      : Promise.resolve(0),
  ]);

  const dailyMap = new Map();
  const paymentMap = new Map();
  const productMap = new Map();

  let totalSalesAmount = 0;
  let totalBills = 0;
  const membersServedSet = new Set();

  sales.forEach((sale) => {
    const dayKey = new Date(sale.createdAt).toISOString().slice(0, 10);
    const current = dailyMap.get(dayKey) || { date: dayKey, bills: 0, sales: 0 };
    current.bills += 1;
    current.sales += Number(sale.finalAmount);
    dailyMap.set(dayKey, current);

    const paymentKey = sale.paymentMethod;
    paymentMap.set(paymentKey, (paymentMap.get(paymentKey) || 0) + 1);

    sale.billItems.forEach((item) => {
      const existing = productMap.get(item.productId) || {
        productId: item.productId,
        name: item.product?.name,
        sku: item.product?.sku,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += Number(item.totalPrice);
      productMap.set(item.productId, existing);
    });

    totalBills += 1;
    totalSalesAmount += Number(sale.finalAmount);
    if (sale.memberId) membersServedSet.add(sale.memberId);
  });

  const memberIds = topMembersRaw.map((item) => item.memberId).filter(Boolean);
  const members = memberIds.length
    ? await prisma.member.findMany({ where: { id: { in: memberIds } } })
    : [];
  const memberMap = new Map(members.map((member) => [member.id, member]));

  return {
    success: true,
    statusCode: 200,
    data: {
      summary: {
        periodDays,
        totalBills,
        totalSalesAmount,
        averageBillValue: totalBills > 0 ? totalSalesAmount / totalBills : 0,
        membersServed: membersServedSet.size,
        stockActions,
      },
      salesOverTime: [...dailyMap.values()],
      paymentBreakdown: [...paymentMap.entries()].map(([method, count]) => ({ method, count })),
      topProducts: [...productMap.values()]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8),
      topMembers: topMembersRaw.map((item) => {
        const member = memberMap.get(item.memberId);
        return {
          memberId: item.memberId,
          fullName: member?.fullName || "Unknown",
          membershipId: member?.membershipId || "-",
          phoneNumber: member?.phoneNumber || "-",
          totalSpent: Number(item._sum.finalAmount || 0),
          totalBills: item._count._all,
        };
      }),
    },
  };
};
