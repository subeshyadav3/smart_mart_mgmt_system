import prisma from "../../config/db.js";
import AppError from "../../utils/apiError.js";

const buildProductResponse = (product) => product;

export const createProduct = async (payload) => {
  const {
    name,
    sku,
    barcode,
    description,
    imageUrl,
    buyingPrice,
    sellingPrice,
    discountPercent = 0,
    stockQuantity = 0,
    minimumStock = 5,
    categoryId,
  } = payload;

  if (!name || !sku || !buyingPrice || !sellingPrice || !categoryId) {
    throw new AppError("Missing required product fields", 400);
  }

  const existing = await prisma.product.findFirst({
    where: {
      OR: [{ sku }, { barcode }],
    },
  });

  if (existing) {
    throw new AppError("Product with same SKU or barcode already exists", 409);
  }

  const product = await prisma.product.create({
    data: {
      name,
      sku,
      barcode,
      description,
      imageUrl,
      buyingPrice: buyingPrice.toString(),
      sellingPrice: sellingPrice.toString(),
      discountPercent,
      stockQuantity,
      minimumStock,
      categoryId,
    },
  });

  return {
    success: true,
    statusCode: 201,
    message: "Product created",
    data: buildProductResponse(product),
  };
};

export const updateProduct = async (id, payload) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError("Product not found", 404);

  const updated = await prisma.product.update({ where: { id }, data: payload });

  return {
    success: true,
    statusCode: 200,
    message: "Product updated",
    data: buildProductResponse(updated),
  };
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) throw new AppError("Product not found", 404);

  return { success: true, statusCode: 200, data: buildProductResponse(product) };
};

export const listProducts = async (query = {}) => {
  const {
    page = 1,
    limit = 20,
    search,
    categoryId,
    status,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
    lowStock,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { barcode: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (status) where.status = status;

  const hasMinPrice = minPrice !== undefined && minPrice !== null && minPrice !== "";
  const hasMaxPrice = maxPrice !== undefined && maxPrice !== null && maxPrice !== "";
  if (hasMinPrice || hasMaxPrice) {
    where.sellingPrice = {};
    if (hasMinPrice) where.sellingPrice.gte = Number(minPrice).toString();
    if (hasMaxPrice) where.sellingPrice.lte = Number(maxPrice).toString();
  }

  const hasMinStock = minStock !== undefined && minStock !== null && minStock !== "";
  const hasMaxStock = maxStock !== undefined && maxStock !== null && maxStock !== "";
  if (hasMinStock || hasMaxStock) {
    where.stockQuantity = {};
    if (hasMinStock) where.stockQuantity.gte = Number(minStock);
    if (hasMaxStock) where.stockQuantity.lte = Number(maxStock);
  }

  if (String(lowStock).toLowerCase() === "true") {
    // Cannot compare two model fields directly in standard Prisma where.
    // Apply low-stock comparison after fetch.
  }

  const safeSortBy = ["createdAt", "updatedAt", "name", "stockQuantity", "sellingPrice"].includes(sortBy)
    ? sortBy
    : "createdAt";
  const safeSortOrder = String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

  const [rawData, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: Number(limit), orderBy: { [safeSortBy]: safeSortOrder } }),
    prisma.product.count({ where }),
  ]);

  const data = String(lowStock).toLowerCase() === "true"
    ? rawData.filter((product) => product.stockQuantity <= product.minimumStock)
    : rawData;

  return {
    success: true,
    statusCode: 200,
    data,
    meta: { total, page: Number(page), limit: Number(limit) },
  };
};

export const adjustStock = async ({ productId, changeAmount, reason, updatedById }) => {
  if (typeof changeAmount !== "number") throw new AppError("changeAmount must be a number", 400);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError("Product not found", 404);

  const previousStock = product.stockQuantity;
  const newStock = previousStock + changeAmount;
  if (newStock < 0) throw new AppError("Insufficient stock for this operation", 400);

  const updatedProduct = await prisma.product.update({ where: { id: productId }, data: { stockQuantity: newStock } });

  await prisma.inventoryLog.create({
    data: {
      productId,
      updatedById,
      previousStock,
      newStock,
      changeAmount,
      reason: reason || (changeAmount > 0 ? "Stock added" : "Stock removed"),
    },
  });

  return {
    success: true,
    statusCode: 200,
    message: "Stock adjusted",
    data: updatedProduct,
  };
};

export const removeProduct = async (id) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError("Product not found", 404);

  await prisma.product.delete({ where: { id } });

  return { success: true, statusCode: 200, message: "Product deleted" };
};
