import express from "express";
import {
  createStaff,
  getAllStaffs,
  updateStaffRole,
  updateStaffStatus,
} from "./workforce.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.post("/staff/create", authMiddleware, authorizeRoles("ADMIN"), createStaff);
router.get("/staffs", authMiddleware, authorizeRoles("ADMIN"), getAllStaffs);
router.patch("/staffs/:id/role", authMiddleware, authorizeRoles("ADMIN"), updateStaffRole);
router.patch("/staffs/:id/status", authMiddleware, authorizeRoles("ADMIN"), updateStaffStatus);

export default router;
