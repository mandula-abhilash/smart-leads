import axios from "axios";
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

export async function fetchBusinessesFromGoogle(hexagonId) {
  try {
    // Get hexagon center coordinates from H3
    const center = h3.cellToLatLng(hexagonId);

    const baseUrl =
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    const initialParams = {
      location: `${center[0]},${center[1]}`,
      radius: 500, // Adjust based on hexagon size
      key: process.env.GOOGLE_PLACES_API_KEY,
      type: ALLOWED_TYPES,
    };

    let allResults = [];
    let nextPageToken = null;
    let retryCount = 0;
    const maxRetries = 3;
    const pageTokenDelay = 2000;

    do {
      try {
        const params = { ...initialParams };
        if (nextPageToken) {
          params.pagetoken = nextPageToken;
          await new Promise((resolve) => setTimeout(resolve, pageTokenDelay));
        }

        const response = await axios.get(baseUrl, { params });

        if (response.data.status === "OK") {
          const filteredResults = response.data.results.filter((place) =>
            place.types.some((type) => ALLOWED_TYPES.includes(type))
          );

          // Fetch detailed information for each business
          const detailedBusinesses = await Promise.all(
            filteredResults.map(async (place) => {
              const details = await fetchPlaceDetails(place.place_id);

              if (!details) {
                return {
                  place_id: place.place_id,
                  name: place.name,
                  address: place.vicinity,
                  location: place.geometry.location,
                  rating: place.rating,
                  user_ratings_total: place.user_ratings_total,
                  types: place.types.filter((type) =>
                    ALLOWED_TYPES.includes(type)
                  ),
                  business_status: place.business_status,
                  photos: place.photos
                    ? place.photos.map((photo) => photo.photo_reference)
                    : [],
                  icon: place.icon,
                };
              }

              return {
                place_id: place.place_id,
                name: details.name,
                address: details.formatted_address,
                phone: details.formatted_phone_number,
                website: details.website,
                location: details.geometry.location,
                rating: details.rating,
                user_ratings_total: details.user_ratings_total,
                types: details.types.filter((type) =>
                  ALLOWED_TYPES.includes(type)
                ),
                business_status: details.business_status,
                photos: details.photos
                  ? details.photos.map((photo) => photo.photo_reference)
                  : [],
                icon: details.icon,
                opening_hours: details.opening_hours,
                price_level: details.price_level,
                google_maps_url: details.url,
                reviews: details.reviews,
              };
            })
          );

          allResults = [...allResults, ...detailedBusinesses];
          nextPageToken = response.data.next_page_token;
          retryCount = 0;
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
        await new Promise((resolve) => setTimeout(resolve, pageTokenDelay));
      }
    } while (nextPageToken);

    return allResults;
  } catch (error) {
    console.error("Error fetching businesses from Google:", error);
    throw error;
  }
}
