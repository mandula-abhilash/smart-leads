import axios from "axios";

export const fetchBusinesses = async (req, res) => {
  try {
    const { lat, lng, pagetoken } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: "Latitude and longitude are required",
      });
    }

    const baseUrl =
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    const params = {
      location: `${lat},${lng}`,
      radius: 6000, // 6km radius
      type: "business",
      key: process.env.GOOGLE_PLACES_API_KEY,
    };

    if (pagetoken) {
      params.pagetoken = pagetoken;
    }

    const response = await axios.get(baseUrl, { params });

    // Process and format the results
    const businesses = response.data.results.map((place) => ({
      place_id: place.place_id,
      name: place.name,
      address: place.vicinity,
      location: place.geometry.location,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      types: place.types,
      business_status: place.business_status,
      photos: place.photos
        ? place.photos.map((photo) => photo.photo_reference)
        : [],
      icon: place.icon,
      opening_hours: place.opening_hours,
    }));

    res.json({
      businesses,
      next_page_token: response.data.next_page_token || null,
      status: response.data.status,
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({
      error: "Failed to fetch businesses",
      details: error.message,
    });
  }
};
