import express from "express";
import * as controller from "./product.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();


router.get("/", authMiddleware, controller.listProducts);
router.get("/:id", authMiddleware, controller.getProduct);

router.post("/", authMiddleware, authorizeRoles("ADMIN", "STAFF"), controller.createProduct);
router.put("/:id", authMiddleware, authorizeRoles("ADMIN", "STAFF"), controller.updateProduct);
router.patch("/:id/stock", authMiddleware, authorizeRoles("ADMIN", "STAFF"), controller.adjustStock);
router.delete("/:id", authMiddleware, authorizeRoles("ADMIN", "STAFF"), controller.removeProduct);

export default router;
