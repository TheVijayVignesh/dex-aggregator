import { Router } from "express";
import { z } from "zod";
import { findBestRoutes } from "../lib/services/pathfinding";
import { getAvailableAssets, getRatesBetween, getRecentRateCount } from "../lib/services/rates-repository";

const router = Router();

// Input validation schema for POST /calculate-route
const calculateRouteSchema = z.object({
  fromAsset: z.string().min(1).max(20).regex(/^[A-Z0-9]+$/, "Must be uppercase alphanumeric"),
  toAsset: z.string().min(1).max(20).regex(/^[A-Z0-9]+$/, "Must be uppercase alphanumeric"),
  amount: z.number().min(0.00000001).max(1e12),
});

// POST /calculate-route
router.post("/calculate-route", async (req, res) => {
  try {
    // Validate request body
    const validatedData = calculateRouteSchema.parse(req.body);

    console.log(`🔄 Route calculation request: ${validatedData.amount} ${validatedData.fromAsset} → ${validatedData.toAsset}`);

    // Calculate best routes
    const result = await findBestRoutes(
      validatedData.fromAsset,
      validatedData.toAsset,
      validatedData.amount
    );

    // Return successful result
    res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('❌ Route calculation error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid input",
        details: error.flatten(),
      });
    }

    // Handle "No route found" errors
    if (error instanceof Error && error.message.includes("No route found")) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    // Handle any other errors
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// GET /assets
router.get("/assets", async (req, res) => {
  try {
    const assets = await getAvailableAssets();

    res.json({
      success: true,
      data: {
        assets,
        count: assets.length,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('❌ Assets fetch error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// GET /rates/:fromAsset/:toAsset
router.get("/rates/:fromAsset/:toAsset", async (req, res) => {
  try {
    const { fromAsset, toAsset } = req.params;
    const fromAssetUpper = fromAsset.toUpperCase();
    const toAssetUpper = toAsset.toUpperCase();

    const rates = await getRatesBetween(fromAssetUpper, toAssetUpper);

    if (rates.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No rates found between ${fromAssetUpper} and ${toAssetUpper}`,
      });
    }

    res.json({
      success: true,
      data: {
        from: fromAssetUpper,
        to: toAssetUpper,
        providers: rates,
      },
    });

  } catch (error) {
    console.error('❌ Rates fetch error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// GET /health
router.get("/health", async (req, res) => {
  try {
    const count = await getRecentRateCount();

    res.json({
      status: "healthy",
      simulationActive: count > 0,
      recentRateCount: count,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      status: "unhealthy",
      simulationActive: false,
      recentRateCount: 0,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /trigger-simulation
router.get("/trigger-simulation", async (req, res) => {
  try {
    // Check for secret key
    const secret = req.headers['x-sim-secret'];
    if (!secret || secret !== process.env.SIM_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { default: gbmScheduler } = await import("../lib/services/gbm-simulator");
    await gbmScheduler.initialize();
    await gbmScheduler.runOnce();
    
    res.json({
      success: true,
      message: "Simulation run complete"
    });

  } catch (error) {
    console.error('❌ Simulation trigger error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

export default router;
