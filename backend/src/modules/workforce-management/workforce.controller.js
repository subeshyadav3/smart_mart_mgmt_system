import * as workforceService from "./workforce.service.js";

export const createStaff = async (req, res, next) => {
  try {
    const payload = req.body;
    const staff = await workforceService.createStaff(payload);
    res.status(201).json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

export const getAllStaffs = async (req, res, next) => {
  try {
    const staffs = await workforceService.getAllStaffs();
    res.json({ success: true, data: staffs });
  } catch (err) {
    next(err);
  }
};

export const updateStaffRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const staff = await workforceService.updateStaffRole(id, role);
    res.json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

export const updateStaffStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const staff = await workforceService.updateStaffStatus(id, isActive);
    res.json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

export const getStaffById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = await workforceService.getStaffById(id);
    res.json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = await workforceService.updateStaff(id, req.body);
    res.json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    await workforceService.deleteStaff(id);
    res.json({ success: true, message: "Staff deleted" });
  } catch (err) {
    next(err);
  }
};
