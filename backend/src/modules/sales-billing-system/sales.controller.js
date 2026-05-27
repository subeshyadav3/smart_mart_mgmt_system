import * as salesService from "./sales.service.js";

export const createSale = async (req, res, next) => {
  try {
    const result = await salesService.createSale({ ...req.body, cashierId: req.user.id });
    res.status(result.statusCode || 201).json(result);
  } catch (err) {
    next(err);
  }
};

export const listSales = async (req, res, next) => {
  try {
    const result = await salesService.listSales(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getSale = async (req, res, next) => {
  try {
    const result = await salesService.getSaleById(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getInvoice = async (req, res, next) => {
  try {
    const result = await salesService.getInvoice(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};