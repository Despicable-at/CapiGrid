import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import type { Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const t = new Date().toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(`${t} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // 1) start Vite in middleware mode
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server },
      watch: { usePolling: true },
    },
    appType: "custom",
    customLogger: {
      ...viteLogger,
      error: (msg, opts) => {
        viteLogger.error(msg, opts);
        process.exit(1);
      },
    },
  });

  // 2) mount Vite's own middleware
  app.use(vite.middlewares);

  // 3) on any other route, serve index.html via Vite (for SPA + HMR)
  app.use("*", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = req.originalUrl;
      const indexPath = path.resolve(__dirname, "..", "client", "index.html");
      let template = await fs.promises.readFile(indexPath, "utf-8");
      // cache‐buster so the browser reloads your client code on every HMR update
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // serve out of dist/public in production
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(`Build output not found at ${distPath}. Did you run npm run build?`);
  }

  // 1) static assets (js/css/images)
  app.use(express.static(distPath));

  // 2) SPA‐fallback: serve index.html for any other GET
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
