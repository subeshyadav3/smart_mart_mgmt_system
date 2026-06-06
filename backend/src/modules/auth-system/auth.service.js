import prisma from "../../config/db.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { generateToken } from "../../utils/jwt.js";
import AppError from "../../utils/apiError.js";

const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export const staffLogin = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const staff = await prisma.staff.findUnique({
    where: { email },
  });

  if (!staff) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!staff.isActive) {
    throw new AppError("Account is inactive", 403);
  }

  const isPasswordValid = await comparePassword(
    password,
    staff.password
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken({
    id: staff.id,
    role: staff.role,
    type: "STAFF",
  });

  return {
    success: true,
    statusCode: 200,
    message: "Login successful",
    data: {
      user: { ...sanitizeUser(staff), type: "STAFF" },
      token,
    },
  };
};

export const memberLogin = async ({
  membershipId,
  password,
}) => {
  if (!membershipId || !password) {
    throw new AppError("Membership ID and password are required", 400);
  }

  const member = await prisma.member.findUnique({
    where: { membershipId },
  });

  if (!member) {
    throw new AppError("Invalid membership ID or password", 401);
  }

  if (!member.isActive) {
    throw new AppError("Membership account is inactive", 403);
  }

  const isPasswordValid = await comparePassword(
    password,
    member.password
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid membership ID or password", 401);
  }

  const token = generateToken({
    id: member.id,
    role: "MEMBER",
    type: "MEMBER",
  });

  return {
    success: true,
    statusCode: 200,
    message: "Login successful",
    data: {
      user: { ...sanitizeUser(member), type: "MEMBER" },
      token,
    },
  };
};

export const registerMember = async ({
  fullName,
  phoneNumber,
  password,
}) => {
  if (!fullName || !phoneNumber || !password) {
    throw new AppError(
      "Full name, phone number, and password are required",
      400
    );
  }

  const existingMember = await prisma.member.findUnique({
    where: { phoneNumber },
  });

  if (existingMember) {
    throw new AppError(
      "Member with this phone number already exists",
      409
    );
  }

  const hashedPassword = await hashPassword(password);

  const member = await prisma.member.create({
    data: {
      fullName,
      phoneNumber,
      password: hashedPassword,
      membershipId: `MEM-${Date.now()}`,
    },
  });

  return {
    success: true,
    statusCode: 201,
    message: "Membership registration successful",
    data: { ...sanitizeUser(member), type: "MEMBER" },
  };
};

export const staffCreateMember = async ({
  fullName,
  phoneNumber,
  password,
}) => {
  if (!fullName || !phoneNumber || !password) {
    throw new AppError(
      "Full name, phone number, and password are required",
      400
    );
  }

  const existingMember = await prisma.member.findUnique({
    where: { phoneNumber },
  });

  if (existingMember) {
    throw new AppError(
      "Member with this phone number already exists",
      409
    );
  }

  const hashedPassword = await hashPassword(password);

  const member = await prisma.member.create({
    data: {
      fullName,
      phoneNumber,
      password: hashedPassword,
      membershipId: `MEM-${Date.now()}`,
    },
  });

  return {
    success: true,
    statusCode: 201,
    message: "Member created successfully",
    data: { ...sanitizeUser(member), type: "MEMBER" },
  };
};

export const updateCurrentUser = async (user, payload = {}) => {
  if (!user?.id || !user?.type) {
    throw new AppError("Not authenticated", 401);
  }

  const data = {};
  const password = payload.password?.trim();

  if (user.type === "MEMBER") {
    if (payload.fullName !== undefined) data.fullName = payload.fullName;
    if (payload.phoneNumber !== undefined) data.phoneNumber = payload.phoneNumber;
    if (password) data.password = await hashPassword(password);
    const updated = await prisma.member.update({ where: { id: user.id }, data });
    return {
      success: true,
      statusCode: 200,
      message: "Profile updated",
      data: sanitizeUser(updated),
    };
  }

  if (user.type === "STAFF") {
    if (payload.fullName !== undefined) data.fullName = payload.fullName;
    if (payload.email !== undefined) data.email = payload.email;
    if (payload.phoneNumber !== undefined) data.phoneNumber = payload.phoneNumber;
    if (password) data.password = await hashPassword(password);
    const updated = await prisma.staff.update({ where: { id: user.id }, data });
    return {
      success: true,
      statusCode: 200,
      message: "Profile updated",
      data: sanitizeUser(updated),
    };
  }

  throw new AppError("Unsupported user type", 400);
};