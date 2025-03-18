"use client";

import { createContext, useContext, useState, useCallback } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const [businesses, setBusinesses] = useState([]);
  const [areaAnalysis, setAreaAnalysis] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedHexagon, setSelectedHexagon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHexagonBusinesses = useCallback(async (hexagonId) => {
    try {
      setIsLoading(true);
      setBusinesses([]);
      setAreaAnalysis(null);
      setSelectedBusiness(null);

      const response = await fetch(
        `${BACKEND_URL}/api/hexagons/${hexagonId}/businesses`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setSelectedHexagon({
        ...data.hexagon,
        businesses_fetched: Boolean(data.hexagon.businesses_fetched),
        no_businesses_found: Boolean(data.hexagon.no_businesses_found),
        hexagon_id: hexagonId,
      });

      setBusinesses(data.businesses || []);
      setAreaAnalysis(data.areaAnalysis);

      return data;
    } catch (error) {
      console.error("Error fetching hexagon data:", error);
      setSelectedHexagon({
        hexagon_id: hexagonId,
        businesses_fetched: true,
        no_businesses_found: true,
        error: "Failed to fetch hexagon data",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createHexagonBusinesses = useCallback(async (hexagonId) => {
    try {
      setIsLoading(true);
      setBusinesses([]);
      setAreaAnalysis(null);
      setSelectedBusiness(null);

      setSelectedHexagon({
        hexagon_id: hexagonId,
        businesses_fetched: false,
        no_businesses_found: false,
        loading: true,
      });

      const response = await fetch(
        `${BACKEND_URL}/api/hexagons/${hexagonId}/businesses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch businesses");
      }

      const data = await response.json();

      setSelectedHexagon({
        ...data.hexagon,
        businesses_fetched: true,
        hexagon_id: hexagonId,
        no_businesses_found: (data.businesses || []).length === 0,
        loading: false,
      });

      setBusinesses(data.businesses || []);
      setAreaAnalysis(data.areaAnalysis);

      return data;
    } catch (error) {
      console.error("Error fetching businesses:", error);
      setSelectedHexagon({
        hexagon_id: hexagonId,
        businesses_fetched: true,
        no_businesses_found: true,
        error: error.message,
        loading: false,
      });
      setBusinesses([]);
      setAreaAnalysis(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBusinessStatus = useCallback(
    async (business) => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/hexagons/businesses/${business.place_id}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: business.status }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update status");
        }

        const updatedBusiness = await response.json();

        setBusinesses((prevBusinesses) =>
          prevBusinesses.map((b) =>
            b.place_id === updatedBusiness.place_id ? updatedBusiness : b
          )
        );

        if (selectedBusiness?.place_id === updatedBusiness.place_id) {
          setSelectedBusiness(updatedBusiness);
        }

        return updatedBusiness;
      } catch (error) {
        console.error("Error updating business status:", error);
        throw error;
      }
    },
    [selectedBusiness]
  );

  const clearSelection = useCallback(() => {
    setSelectedHexagon(null);
    setSelectedBusiness(null);
    setBusinesses([]);
    setAreaAnalysis(null);
  }, []);

  const value = {
    businesses,
    areaAnalysis,
    selectedBusiness,
    selectedHexagon,
    isLoading,
    setSelectedBusiness,
    fetchHexagonBusinesses,
    createHexagonBusinesses,
    updateBusinessStatus,
    clearSelection,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error(
      "useBusinessContext must be used within a BusinessProvider"
    );
  }
  return context;
}
