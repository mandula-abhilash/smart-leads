import axios from "axios";
import * as h3 from "h3-js";
import ALLOWED_TYPES from "../constants/allowedTypes.js";

const fetchPlaceDetails = async (placeId) => {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: placeId,
          key: process.env.GOOGLE_PLACES_API_KEY,
          fields: [
            "name",
            "formatted_address",
            "formatted_phone_number",
            "website",
            "opening_hours",
            "rating",
            "user_ratings_total",
            "geometry",
            "types",
            "business_status",
            "photos",
            "icon",
            "url",
            "price_level",
            "reviews",
          ].join(","),
        },
      }
    );

    if (response.data.status === "OK") {
      return response.data.result;
    }
    throw new Error(
      `Place Details API returned status: ${response.data.status}`
    );
  } catch (error) {
    console.error(`Error fetching place details for ${placeId}:`, error);
    return null;
  }
};

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

export async function fetchBusinessesFromGoogle(hexagonId) {
  try {
    // Get hexagon center coordinates from H3
    const [lat, lng] = h3.cellToLatLng(hexagonId);

    const baseUrl =
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    const initialParams = {
      location: `${lat},${lng}`,
      radius: 500,
      key: process.env.GOOGLE_PLACES_API_KEY,
      type: ALLOWED_TYPES,
    };

    const allResults = await fetchAllPages(baseUrl, initialParams);

    // Filter results to only include businesses of allowed types
    const filteredResults = allResults.filter((place) =>
      place.types.some((type) => ALLOWED_TYPES.includes(type))
    );

    // Fetch detailed information for each business
    const detailedBusinesses = await Promise.all(
      filteredResults.map(async (place) => {
        const details = await fetchPlaceDetails(place.place_id);

        if (!details) {
          // If details fetch failed, return basic info from nearby search
          return {
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.vicinity,
            location: place.geometry.location,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            types: place.types.filter((type) => ALLOWED_TYPES.includes(type)),
            business_status: place.business_status,
            photos: place.photos
              ? place.photos.map((photo) => photo.photo_reference)
              : [],
            icon: place.icon,
            hexagon_id: hexagonId,
          };
        }

        // Return enhanced business details
        return {
          place_id: place.place_id,
          name: details.name,
          formatted_address: details.formatted_address,
          formatted_phone_number: details.formatted_phone_number,
          website: details.website,
          location: details.geometry.location,
          rating: details.rating,
          user_ratings_total: details.user_ratings_total,
          types: details.types.filter((type) => ALLOWED_TYPES.includes(type)),
          business_status: details.business_status,
          photos: details.photos
            ? details.photos.map((photo) => photo.photo_reference)
            : [],
          icon: details.icon,
          opening_hours: details.opening_hours,
          price_level: details.price_level,
          url: details.url,
          reviews: details.reviews,
          hexagon_id: hexagonId,
        };
      })
    );

    return detailedBusinesses;
  } catch (error) {
    console.error("Error fetching businesses from Google:", error);
    throw error;
  }
}
