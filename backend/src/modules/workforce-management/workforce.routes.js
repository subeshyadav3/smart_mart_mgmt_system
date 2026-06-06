import express from "express";
import {
  createStaff,
  getAllStaffs,
  getStaffById,
  updateStaff,
  deleteStaff,
  updateStaffRole,
  updateStaffStatus,
} from "./workforce.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.post("/staff/create", authMiddleware, authorizeRoles("ADMIN"), createStaff);
router.get("/staffs", authMiddleware, authorizeRoles("ADMIN"), getAllStaffs);
router.get("/staffs/:id", authMiddleware, authorizeRoles("ADMIN"), getStaffById);
router.put("/staffs/:id", authMiddleware, authorizeRoles("ADMIN"), updateStaff);
router.patch("/staffs/:id/role", authMiddleware, authorizeRoles("ADMIN"), updateStaffRole);
router.patch("/staffs/:id/status", authMiddleware, authorizeRoles("ADMIN"), updateStaffStatus);
router.delete("/staffs/:id", authMiddleware, authorizeRoles("ADMIN"), deleteStaff);

export default router;
