import express from "express";
import * as controller from "./sales.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, controller.listSales);
router.get("/analytics", authMiddleware, authorizeRoles("ADMIN", "STAFF"), controller.getSalesAnalytics);
router.post("/", authMiddleware, authorizeRoles("ADMIN", "STAFF"), controller.createSale);
router.get("/:id/invoice", authMiddleware, controller.getInvoice);
router.get("/:id", authMiddleware, controller.getSale);
router.get("/:id/audit", authMiddleware, authorizeRoles("ADMIN", "STAFF"), controller.getSaleAuditTrail);
router.put("/:id", authMiddleware, authorizeRoles("ADMIN", "STAFF"), controller.updateSale);
router.patch("/:id/cancel", authMiddleware, authorizeRoles("ADMIN", "STAFF"), controller.cancelSale);

export default router;
