# VISDAK Smart Leads

### Project Requirements: Hexagon-Based Business Tracker

## **Technology Stack**

- **Frontend:** Next.js 15 (React 19, JavaScript)
- **Styling:** Tailwind CSS 4
- **Backend:** Express.js (Node.js, JavaScript)
- **Database:** PostgreSQL
- **APIs Used:**
  - Google Places API (Nearby Search, Place Details)
  - H3 (Hexagonal grid system)
- **Deployment:** Docker (Optional), PM2 for backend process management

---

## **Frontend Requirements (Next.js 15 + React 19)**

### **1️⃣ Google Maps with Hexagonal Grid Overlay**

- Integrate Google Maps API and display the map.
- Overlay H3 hexagons (resolution 7) on the map.
- Render hexagons as polygons with proper boundaries.
- Differentiate completed vs. uncompleted hexagons with color coding.
- Allow users to click on a hexagon to trigger business data retrieval.
- Show a loading state while fetching data.
- Ensure map is responsive on mobile and desktop.

### **2️⃣ Hexagon Interaction & UI**

✅ Clicking a hexagon should:

- Highlight it
- Fetch businesses from the backend
- Display business details in a sidebar or modal
  - Show business details such as:
    - Name, category, website, rating, number of reviews
- Show a "Completed" indicator for hexagons that have already been processed.
- Implement a search feature to jump to a specific location.
- Ensure smooth panning and zooming on Google Maps.

### **3️⃣ Styling & UI/UX (Tailwind CSS 4)**

- Use Tailwind for styling with a clean, minimalistic UI.
- Implement a sidebar or modal for displaying business details.
- Ensure consistent spacing, fonts, and UI responsiveness.
- Implement hover effects for hexagons to indicate interactivity.
- Show visual feedback when a hexagon is clicked.

---

## **Backend Requirements (Express.js + Node.js)**

### **4️⃣ API to Fetch Businesses within a Hexagon**

- Create an API endpoint (`/api/fetch-businesses`).
- Accept hexagon ID (`h3Index`), lat, and lng as parameters.
- Query Google Places API to fetch **all businesses** within the hexagon.
- Paginate requests (handle `pagetoken` for 60+ results).
- Extract relevant details:
  - Business Name
  - Category
  - Website (if available)
  - Rating
  - Number of reviews
  - Address
- Return the structured data to the frontend.
- Implement basic error handling (e.g., API rate limits, empty results).

### **5️⃣ Database Integration (MongoDB or PostgreSQL)**

- Store **hexagon completion status** in the database.
- Store **business details** (to avoid redundant API calls).
- Track **last updated timestamp** for each hexagon.
- If a hexagon is clicked again, **fetch from the database first** before making an API call.
- Implement indexes for efficient lookups.

### **6️⃣ Admin Panel (Basic UI for Data Monitoring - Optional)**

- Show a list of completed hexagons.
- Show a searchable table of collected businesses.
- Allow filtering businesses by category, website availability, rating.
- Allow marking businesses for outreach (e.g., need a website redesign).

---

## **Google Places API Usage & Cost Optimization**

### **7️⃣ Optimize API Calls to Stay Within Free Limits**

- Use **radius = 6000m** (covers full hexagon area, prevents overlaps).
- **Batch requests** efficiently to reduce API calls.
- Use **database caching** to avoid duplicate API calls.
- Implement **retry logic** for failed requests (Google API rate limits).
- Set up **Google Cloud budget alerts** to monitor API costs.

---

## **Deployment & DevOps**

### **8️⃣ Backend Deployment**

- Use PM2 to keep the Express server running.
- Set up logging for API errors & usage tracking.
- Deploy using **Docker (Optional)** or **bare-metal Node.js setup**.

### **9️⃣ Frontend Deployment**

- Deploy the Next.js app on **Vercel or DigitalOcean**.
- Ensure the map loads efficiently on all devices.
- Optimize **lazy loading** for Google Maps API.
- Enable **SSR for better SEO & performance.**

---

## **Checklist Summary**

- Google Maps integration with hexagonal overlay
- Clickable hexagons that trigger business data fetching
- Business details UI (sidebar or modal)
- Express.js backend API to fetch business data
- MongoDB/PostgreSQL storage for business & hexagon tracking
- API rate limit optimizations
- Admin panel for monitoring collected data (optional)
- Deployment with PM2, Vercel/DigitalOcean

---

### **🎯 Next Steps:**

1. Set up **Google Maps & Places API**.
2. Implement **hexagon rendering & interactivity** in Next.js.
3. Build **backend API to fetch business data**.
4. Integrate **database storage** for tracking.
5. Deploy & test with real data.
