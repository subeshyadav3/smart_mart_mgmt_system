import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const environment = process.env.NODE_ENV || "local";

const localEnvPath = path.resolve(process.cwd(), `.env.${environment}`);
const fallbackEnvPath = path.resolve(process.cwd(), ".env");

dotenv.config({
  path: fs.existsSync(localEnvPath) ? localEnvPath : fallbackEnvPath,
});

console.log(`Loaded environment: ${environment}`);