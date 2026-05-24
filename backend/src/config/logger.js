import fs from "fs";
import path from "path";
import morgan from "morgan";

const logDir = path.resolve(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logStream = fs.createWriteStream(
  path.join(logDir, "app.log"),
  { flags: "a" }
);

morgan.token("user", (req) => req.user?.id || "guest");
morgan.token("time", () => new Date().toISOString());
morgan.token("path", (req) => req.originalUrl.split("?")[0]);

const requestLogger = morgan(
  "[:time] :method :path | status=:status | ms=:response-time | user=:user",
  {
    stream: logStream,
  }
);

export { logStream, requestLogger };