// server/vite.ts
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer as createViteServer, createLogger, type Logger } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import type { Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

// Compute __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// A simple timestamped logger
export function log(message: string, source = "express") {
  const t = new Date().toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(`${t} [${source}] ${message}`);
}

// Development: mount the Vite dev server as middleware
export async function setupVite(app: Express, server: Server) {
  // Create Vite in middleware mode
  const viteLogger: Logger = createLogger();
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

  // 1) Vite's own middleware (serves /@modules, transforms on the fly)
  app.use(vite.middlewares);

  // 2) SPA fallback for everything else
  app.use("*", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = req.originalUrl;
      const indexPath = path.resolve(__dirname, "..", "client", "index.html");
      let template = await fs.promises.readFile(indexPath, "utf-8");

      // optional cache busting so HMR always reloads the newest build
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

// Production: serve the built files out of dist/public
export function serveStatic(app: Express) {
  // <- point this at your Vite build output
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `❌ Build folder not found at ${distPath}. Did you run \`npm run build\`?`
    );
  }

  // 1) serve JS/CSS/assets
  app.use(express.static(distPath));

  // 2) SPA fallback: any other GET gets index.html
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
