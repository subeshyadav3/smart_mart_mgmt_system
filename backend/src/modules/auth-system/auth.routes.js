import express from "express";

import {
  staffLogin,
  memberLogin,
  registerMember,
  getCurrentUser,
  logout,
  staffCreateMember,
  getAllMembers,
  getSingleMember,
  updateMemberStatus,
  createStaff,
  getAllStaffs,
  updateStaffRole,
  updateStaffStatus,
} from "./auth.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { allowUserTypes } from "../../middlewares/type.middleware.js";

const router = express.Router();

router.post("/staff/login", staffLogin);
router.post("/member/login", memberLogin);
router.post("/member/register", registerMember);

router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logout);

router.post("/member/create", authMiddleware, authorizeRoles("ADMIN", "STAFF"), staffCreateMember);

router.get("/members", authMiddleware, authorizeRoles("ADMIN", "STAFF"), getAllMembers);

router.get("/members/:id", authMiddleware, authorizeRoles("ADMIN", "STAFF"), getSingleMember);

router.patch("/members/:id/status", authMiddleware, authorizeRoles("ADMIN", "STAFF"), updateMemberStatus);

router.post("/staff/create", authMiddleware, authorizeRoles("ADMIN"), createStaff);

router.get("/staffs", authMiddleware, authorizeRoles("ADMIN"), getAllStaffs);

router.patch("/staffs/:id/role", authMiddleware, authorizeRoles("ADMIN"), updateStaffRole);

router.patch("/staffs/:id/status", authMiddleware, authorizeRoles("ADMIN"), updateStaffStatus);

export default router;