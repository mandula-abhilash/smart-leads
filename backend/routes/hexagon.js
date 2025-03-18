import express from "express";
import {
  getHexagonBusinesses,
  createHexagonBusinesses,
  updateBusinessStatus,
} from "../controllers/hexagonController.js";

const router = express.Router();

// Get all businesses for a hexagon
router.get("/:hexagonId/businesses", getHexagonBusinesses);

// Save businesses for a hexagon
router.post("/:hexagonId/businesses", createHexagonBusinesses);

// Update business status
router.put("/businesses/:placeId/status", updateBusinessStatus);

export default router;
