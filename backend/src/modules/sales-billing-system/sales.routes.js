import express from "express";
import * as controller from "./sales.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, controller.listSales);
router.get("/:id", authMiddleware, controller.getSale);
router.post("/", authMiddleware, authorizeRoles("ADMIN", "STAFF"), controller.createSale);
router.get("/:id/invoice", authMiddleware, controller.getInvoice);

export default router;
