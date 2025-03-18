import {
  getHexagonById,
  updateHexagonStatus,
  createHexagon,
} from "../models/hexagon.js";
import {
  createBusiness,
  getBusinessesByHexagon,
  getBusinessById,
  updateBusinessStatus as updateStatus,
} from "../models/business.js";
import { processBusinesses } from "../services/businessAnalyzer.js";

export async function getHexagonBusinesses(req, res) {
  try {
    const { hexagonId } = req.params;

    // Get hexagon details
    const hexagon = await getHexagonById(hexagonId);

    if (!hexagon) {
      return res.status(404).json({
        error: "Hexagon not found",
      });
    }

    // Get businesses for this hexagon
    const businesses = await getBusinessesByHexagon(hexagonId);

    // Process businesses through the analyzer
    const processedData = processBusinesses(businesses);

    res.json({
      hexagon: {
        ...hexagon,
        businesses_fetched: true,
      },
      ...processedData,
    });
  } catch (error) {
    console.error("Error fetching hexagon businesses:", error);
    res.status(500).json({
      error: "Failed to fetch hexagon businesses",
      details: error.message,
    });
  }
}

export async function createHexagonBusinesses(req, res) {
  try {
    const { hexagonId } = req.params;
    const { businesses, geometry, center } = req.body;

    if (!businesses || !Array.isArray(businesses)) {
      return res.status(400).json({
        error: "Invalid businesses data",
      });
    }

    // Create or update hexagon
    let hexagon = await getHexagonById(hexagonId);

    if (!hexagon) {
      hexagon = await createHexagon({
        hexagon_id: hexagonId,
        geometry,
        center,
      });
    }

    // Save each business
    const savedBusinesses = await Promise.all(
      businesses.map(async (business) => {
        try {
          const result = await createBusiness({
            ...business,
            hexagon_id: hexagonId,
          });
          return result[0];
        } catch (error) {
          console.error(`Error saving business ${business.place_id}:`, error);
          return null;
        }
      })
    );

    // Filter out failed saves
    const validBusinesses = savedBusinesses.filter(Boolean);

    // Update hexagon status
    await updateHexagonStatus(hexagonId, {
      businesses_fetched: true,
      no_businesses_found: validBusinesses.length === 0,
    });

    // Process businesses through the analyzer
    const processedData = processBusinesses(validBusinesses);

    res.json({
      hexagon: {
        ...hexagon,
        businesses_fetched: true,
        no_businesses_found: validBusinesses.length === 0,
      },
      ...processedData,
    });
  } catch (error) {
    console.error("Error creating hexagon businesses:", error);
    res.status(500).json({
      error: "Failed to create hexagon businesses",
      details: error.message,
    });
  }
}

export async function updateBusinessStatus(req, res) {
  try {
    const { placeId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: "Status is required",
      });
    }

    // Validate status
    const validStatuses = [
      "new",
      "contacted",
      "responded",
      "converted",
      "rejected",
      "ignored",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        validStatuses,
      });
    }

    // Update business status
    await updateStatus(placeId, status);

    // Get updated business
    const business = await getBusinessById(placeId);

    if (!business) {
      return res.status(404).json({
        error: "Business not found",
      });
    }

    res.json(business);
  } catch (error) {
    console.error("Error updating business status:", error);
    res.status(500).json({
      error: "Failed to update business status",
      details: error.message,
    });
  }
}
