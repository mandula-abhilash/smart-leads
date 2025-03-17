import axios from "axios";

const ALLOWED_TYPES = [
  "accounting",
  "airport",
  "amusement_park",
  "aquarium",
  "art_gallery",
  "atm",
  "bakery",
  "bank",
  "bar",
  "beauty_salon",
  "bicycle_store",
  "book_store",
  "bowling_alley",
  "bus_station",
  "cafe",
  "campground",
  "car_dealer",
  "car_rental",
  "car_repair",
  "car_wash",
  "casino",
  "cemetery",
  "church",
  "city_hall",
  "clothing_store",
  "convenience_store",
  "courthouse",
  "dentist",
  "department_store",
  "doctor",
  "drugstore",
  "electrician",
  "electronics_store",
  "embassy",
  "fire_station",
  "florist",
  "funeral_home",
  "furniture_store",
  "gas_station",
  "gym",
  "hair_care",
  "hardware_store",
  "hindu_temple",
  "home_goods_store",
  "hospital",
  "insurance_agency",
  "jewelry_store",
  "laundry",
  "lawyer",
  "library",
  "light_rail_station",
  "liquor_store",
  "local_government_office",
  "locksmith",
  "lodging",
  "meal_delivery",
  "meal_takeaway",
  "mosque",
  "movie_rental",
  "movie_theater",
  "moving_company",
  "museum",
  "night_club",
  "painter",
  "park",
  "parking",
  "pet_store",
  "pharmacy",
  "physiotherapist",
  "plumber",
  "police",
  "post_office",
  "primary_school",
  "real_estate_agency",
  "restaurant",
  "roofing_contractor",
  "rv_park",
  "school",
  "secondary_school",
  "shoe_store",
  "shopping_mall",
  "spa",
  "stadium",
  "storage",
  "store",
  "subway_station",
  "supermarket",
  "synagogue",
  "taxi_stand",
  "tourist_attraction",
  "train_station",
  "transit_station",
  "travel_agency",
  "university",
  "veterinary_care",
  "zoo",
];

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
      radius: 1000, // Adjusted to ~1000m to match H3 resolution 8 hexagon size
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
