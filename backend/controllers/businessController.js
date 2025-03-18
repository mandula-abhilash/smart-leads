import axios from "axios";
import ALLOWED_TYPES from "../constants/allowedTypes.js";

const fetchAllPages = async (baseUrl, initialParams) => {
  let allResults = [];
  let nextPageToken = null;
  let retryCount = 0;
  const maxRetries = 3;
  const pageTokenDelay = 2000; // 2 seconds delay for pagetoken

  do {
    try {
      const params = { ...initialParams };
      if (nextPageToken) {
        params.pagetoken = nextPageToken;
        // Wait for pagetoken to become valid
        await new Promise((resolve) => setTimeout(resolve, pageTokenDelay));
      }

      const response = await axios.get(baseUrl, { params });

      if (response.data.status === "OK") {
        allResults = [...allResults, ...response.data.results];
        nextPageToken = response.data.next_page_token;
        retryCount = 0; // Reset retry count on successful request
      } else if (response.data.status === "ZERO_RESULTS") {
        break;
      } else {
        throw new Error(`API returned status: ${response.data.status}`);
      }
    } catch (error) {
      retryCount++;
      if (retryCount >= maxRetries) {
        console.error("Max retries reached for pagetoken:", error);
        break;
      }
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, pageTokenDelay));
    }
  } while (nextPageToken);

  return allResults;
};

export const fetchBusinesses = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: "Latitude and longitude are required",
      });
    }

    const baseUrl =
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    const initialParams = {
      location: `${lat},${lng}`,
      radius: 500, // Adjusted to ~500 to match H3 resolution 8 hexagon size
      key: process.env.GOOGLE_PLACES_API_KEY,
      type: ALLOWED_TYPES,
    };

    const allResults = await fetchAllPages(baseUrl, initialParams);

    // Filter results to only include businesses of allowed types
    const filteredResults = allResults.filter((place) =>
      place.types.some((type) => ALLOWED_TYPES.includes(type))
    );

    // Process and format the results
    const businesses = filteredResults.map((place) => ({
      place_id: place.place_id,
      name: place.name,
      address: place.vicinity,
      location: place.geometry.location,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      types: place.types.filter((type) => ALLOWED_TYPES.includes(type)),
      business_status: place.business_status,
      photos: place.photos
        ? place.photos.map((photo) => photo.photo_reference)
        : [],
      icon: place.icon,
      opening_hours: place.opening_hours,
    }));

    res.json({
      businesses,
      total_results: businesses.length,
      status: "OK",
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({
      error: "Failed to fetch businesses",
      details: error.message,
    });
  }
};
