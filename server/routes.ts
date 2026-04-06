import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { registerCurrencyRoutes } from "./currency-routes";
import exchangeRouter from "./exchange-routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Register crypto exchange routes
  app.use("/api/exchange", exchangeRouter);

  // Register currency routes (stubbed for compatibility)
  registerCurrencyRoutes(app);

  return httpServer;
}
