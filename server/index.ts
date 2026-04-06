import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Track initialization so we don't register routes multiple times
let initialized = false;
let initPromise: Promise<void> | null = null;

async function initialize() {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await registerRoutes(httpServer, app);
    initialized = true;
  })();

  return initPromise;
}

// Middleware that ensures routes are registered before handling any request
app.use(async (req, res, next) => {
  try {
    await initialize();
    next();
  } catch (err) {
    next(err);
  }
});

// Dev: start the server normally
if (process.env.NODE_ENV !== "production") {
  (async () => {
    await initialize();

    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);

    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen({ port, host: "localhost" }, async () => {
      log(`serving on port ${port}`);

      try {
        const { default: gbmScheduler } = await import("../lib/services/gbm-simulator");
        await gbmScheduler.initialize();
        gbmScheduler.start(60000);
        log("GBM scheduler started successfully");
      } catch (error) {
        log(`Failed to start GBM scheduler: ${error}`);
      }
    });
  })();
}

export default app;