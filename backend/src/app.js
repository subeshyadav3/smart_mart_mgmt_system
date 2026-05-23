import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import './config/env.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
  {
    origin: process.env.frontend_url,
    credentials: true,
  }
));

app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Mart API running",
  });
});


export default app;