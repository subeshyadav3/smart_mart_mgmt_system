import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import './config/env.js';
import { requestLogger } from "./config/logger.js";

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


export default app;