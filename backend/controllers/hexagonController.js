import {
  getHexagonById,
  updateHexagonStatus,
  createHexagon,
  getAllHexagonIds,
} from "../models/hexagon.js";
import {
  createBusiness,
  getBusinessesByHexagon,
  getBusinessById,
  updateBusinessStatus as updateStatus,
} from "../models/business.js";
import { processBusinesses } from "../services/businessAnalyzer.js";
import { fetchBusinessesFromGoogle } from "../services/googlePlaces.js";

export async function getHexagonBusinesses(req, res) {
  try {
    const { hexagonId } = req.params;

    // Get hexagon details
    let hexagon = await getHexagonById(hexagonId);

    // If hexagon doesn't exist, create it with initial state
    if (!hexagon) {
      const [newHexagon] = await createHexagon({
        hexagon_id: hexagonId,
        businesses_fetched: false,
        no_businesses_found: false,
      });
      hexagon = newHexagon;
    }

    // Get businesses for this hexagon if they exist
    const businesses = await getBusinessesByHexagon(hexagonId);

    // Process businesses through the analyzer if they exist
    const processedData =
      businesses.length > 0
        ? processBusinesses(businesses)
        : {
            businesses: [],
            areaAnalysis: null,
          };

    res.json({
      hexagon: {
        ...hexagon,
        businesses_fetched: Boolean(hexagon.businesses_fetched),
        no_businesses_found: Boolean(hexagon.no_businesses_found),
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

    // Fetch businesses from Google Places API
    const businesses = await fetchBusinessesFromGoogle(hexagonId);

    // Create or update hexagon
    let hexagon = await getHexagonById(hexagonId);

    if (!hexagon) {
      const [newHexagon] = await createHexagon({
        hexagon_id: hexagonId,
        businesses_fetched: true,
        no_businesses_found: businesses.length === 0,
      });
      hexagon = newHexagon;
    } else {
      await updateHexagonStatus(hexagonId, {
        businesses_fetched: true,
        no_businesses_found: businesses.length === 0,
      });
      hexagon = await getHexagonById(hexagonId);
    }

    // Save each business
    const savedBusinesses = await Promise.all(
      businesses.map(async (business) => {
        try {
          const [result] = await createBusiness({
            ...business,
            hexagon_id: hexagonId,
            status: "new", // Default status for new businesses
          });

          // Transform geometry to location
          if (result) {
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lng);
            return {
              ...result,
              location: { lat, lng },
              // Remove geometry and lat/lng fields
              geometry: undefined,
              lat: undefined,
              lng: undefined,
            };
          }
          return null;
        } catch (error) {
          console.error(`Error saving business ${business.place_id}:`, error);
          return null;
        }
      })
    );

    // Filter out failed saves
    const validBusinesses = savedBusinesses.filter(Boolean);

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
      "follow_up",
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

export async function getExistingHexagons(req, res) {
  try {
    const { hexagonIds, noBusinessHexagonIds } = await getAllHexagonIds();
    res.json({ hexagonIds, noBusinessHexagonIds });
  } catch (error) {
    console.error("Error fetching existing hexagons:", error);
    res.status(500).json({
      error: "Failed to fetch existing hexagons",
      details: error.message,
    });
  }
}
