import dotenv from "dotenv";

const environment = process.env.NODE_ENV || "local";

dotenv.config({
  path: `.env.${environment}`,
});

console.log(`Loaded environment: ${environment}`);