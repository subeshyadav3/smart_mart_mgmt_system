import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import "./config/env.js";
import { requestLogger } from "./config/logger.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth-system/auth.routes.js";
import productRoutes from "./modules/product-inventory-system/product.routes.js";
import workforceRoutes from "./modules/workforce-management/workforce.routes.js";
import salesRoutes from "./modules/sales-billing-system/sales.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple CORS: read single origin from env (FRONTEND_URL), normalize it,
// and fall back to localhost dev origin. Keep config minimal and standard.
const rawFrontend = process.env.FRONTEND_URL || process.env.frontend_url || "http://localhost:5174";
const frontendOrigin = (rawFrontend || "").toString().trim().replace(/\/$/, "");

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);

app.use(helmet());
app.use(cookieParser());

app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Mart API running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/workforce", workforceRoutes);
app.use("/api/sales", salesRoutes);

app.use(errorMiddleware);

export default app;