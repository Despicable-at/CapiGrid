import express, { type Request, type Response, type NextFunction, type Express } from "express";
import http from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToDatabase, seedDatabase } from "./database";

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// simple timing + JSON‐body logger for any /api routes
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: unknown;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedJson = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJson !== undefined) {
        line += ` :: ${JSON.stringify(capturedJson)}`;
      }
      if (line.length > 120) line = line.slice(0, 119) + "…";
      log(line, "api");
    }
  });

  next();
});

(async () => {
  // 1) DB connect + seed
  await connectToDatabase();
  await seedDatabase();

  // 2) HTTP server wrapper (needed so Vite HMR can hook websocket)
  const server = http.createServer(app);

  // 3) Register your API routes
  await registerRoutes(app);

  // 4) Error handler (must come after registerRoutes)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
    log(`Error ${status}: ${err.message}`, "error");
  });

  // 5) Vite in dev vs. static in prod
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 6) Start listening on port 5000
  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`🚀 Listening on http://0.0.0.0:${PORT}`, "express");
  });
})();
