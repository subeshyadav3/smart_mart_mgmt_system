import * as authService from "./auth.service.js";
import prisma from "../../config/db.js";
import { hashPassword } from "../../utils/password.js";


export const staffLogin = async (req, res, next) => {
  try {
    const result = await authService.staffLogin(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};


export const memberLogin = async (req, res, next) => {
  try {
    const result = await authService.memberLogin(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};


export const registerMember = async (req, res, next) => {
  try {
    const member = await authService.registerMember(req.body);
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
};

export const staffCreateMember = async (req, res, next) => {
  try {
    const member = await authService.staffCreateMember(req.body);
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
};

const sanitize = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const { id, type } = req.user || {};
    if (!id) return res.status(401).json({ message: "Not authenticated" });

    if (type === "STAFF") {
      const staff = await prisma.staff.findUnique({ where: { id } });
      return res.json({ success: true, data: sanitize(staff) });
    }

    const member = await prisma.member.findUnique({ where: { id } });
    return res.json({ success: true, data: { ...sanitize(member), type: "MEMBER" } });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  return res.json({ success: true, message: "Logged out" });
};

export const updateCurrentUser = async (req, res, next) => {
  try {
    const result = await authService.updateCurrentUser(req.user, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getAllMembers = async (req, res, next) => {
  try {
    const members = await prisma.member.findMany();
    res.json({ success: true, data: members.map(sanitize) });
  } catch (err) {
    next(err);
  }
};

export const getSingleMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json({ success: true, data: sanitize(member) });
  } catch (err) {
    next(err);
  }
};

export const updateMemberStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const member = await prisma.member.update({ where: { id }, data: { isActive } });
    res.json({ success: true, data: sanitize(member) });
  } catch (err) {
    next(err);
  }
};

export const updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    if (payload.password) {
      payload.password = await hashPassword(payload.password);
    }

    const member = await prisma.member.update({ where: { id }, data: payload });
    res.json({ success: true, data: sanitize(member) });
  } catch (err) {
    next(err);
  }
};

export const deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.member.delete({ where: { id } });
    res.json({ success: true, message: "Member deleted" });
  } catch (err) {
    next(err);
  }
};
