import express from "express";
import {
  getHexagonBusinesses,
  createHexagonBusinesses,
  updateBusinessStatus,
  getExistingHexagons,
} from "../controllers/hexagonController.js";

const router = express.Router();

// Get businesses for a hexagon (also creates hexagon if it doesn't exist)
router.get("/:hexagonId/businesses", getHexagonBusinesses);

// Save businesses for a hexagon
router.post("/:hexagonId/businesses", createHexagonBusinesses);

// Update business status
router.put("/businesses/:placeId/status", updateBusinessStatus);

// Get all existing hexagon IDs
router.get("/existing", getExistingHexagons);

export default router;
