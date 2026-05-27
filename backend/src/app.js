import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import './config/env.js';
import { requestLogger } from "./config/logger.js";
import authRoutes from "./modules/auth-system/auth.routes.js";
import productRoutes from "./modules/product-inventory-system/product.routes.js";
import workforceRoutes from "./modules/workforce-management/workforce.routes.js";
// import salesRoutes from "./modules/sales-billing-system/sales.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
  {
    origin: process.env.frontend_url,
    credentials: true,
  }
));

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
// app.use("/api/sales", salesRoutes);


export default app;