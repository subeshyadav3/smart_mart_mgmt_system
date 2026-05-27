import prisma from "../../config/db.js";
import { hashPassword } from "../../utils/password.js";

const sanitize = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

export const createStaff = async ({ fullName, email, password, phoneNumber, role = "STAFF", isActive = true }) => {
  const hashed = await hashPassword(password || Math.random().toString(36).slice(-8));
  const staff = await prisma.staff.create({ data: { fullName, email, password: hashed, phoneNumber, role, isActive } });
  return sanitize(staff);
};

export const getAllStaffs = async () => {
  const staffs = await prisma.staff.findMany();
  return staffs.map(sanitize);
};

export const updateStaffRole = async (id, role) => {
  const staff = await prisma.staff.update({ where: { id }, data: { role } });
  return sanitize(staff);
};

export const updateStaffStatus = async (id, isActive) => {
  const staff = await prisma.staff.update({ where: { id }, data: { isActive } });
  return sanitize(staff);
};
