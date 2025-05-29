// server/index.ts
import express, { type Request, type Response, type NextFunction, type Express } from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToDatabase, seedDatabase } from "./database";

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Optional: timing + JSON‐body logger for any /api routes
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
      if (capturedJson !== undefined) line += ` :: ${JSON.stringify(capturedJson)}`;
      if (line.length > 120) line = line.slice(0, 119) + "…";
      log(line, "api");
    }
  });
  next();
});

(async () => {
  // 1) DB connect & seed
  await connectToDatabase();
  await seedDatabase();

  // 2) Wrap in HTTP server (needed for Vite HMR websocket)
  const server = http.createServer(app);

  // 3) Register /api routes
  await registerRoutes(app);

  // 4) Error handler (after routes)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    log(`Error ${status}: ${err.message}`, "error");
    res.status(status).json({ message: err.message || "Internal Server Error" });
  });

  // 5) Dev vs Prod asset serving
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 6) Listen on Render’s provided port (fallback to 5000 locally)
  const PORT = parseInt(process.env.PORT || "5000", 10);
  server.listen(PORT, "0.0.0.0", () => {
    log(`🚀 Listening on http://0.0.0.0:${PORT}`, "express");
  });
})();
