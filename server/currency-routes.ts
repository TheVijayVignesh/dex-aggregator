import type { Express } from "express";

export function registerCurrencyRoutes(app: Express) {
  // Legacy currency routes have been replaced by the new crypto exchange system
  // This file is kept for compatibility but routes are now handled by /api/exchange
  
  console.log("🔄 Legacy currency routes disabled - using new crypto exchange system");
}
