import * as productService from "./product.service.js";

export const createProduct = async (req, res, next) => {
  try {
    const result = await productService.createProduct(req.body);
    res.status(result.statusCode || 201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await productService.updateProduct(id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await productService.getProductById(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const listProducts = async (req, res, next) => {
  try {
    const result = await productService.listProducts(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { changeAmount, reason } = req.body;
    const updatedById = req.user && req.user.id;
    const result = await productService.adjustStock({ productId: id, changeAmount, reason, updatedById });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const removeProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await productService.removeProduct(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
