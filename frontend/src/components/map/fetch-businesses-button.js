"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function FetchBusinessesButton({ hexagonId, onFetchComplete }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/hexagons/${hexagonId}/businesses`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch businesses");
      }

      const data = await response.json();
      onFetchComplete(data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleFetch} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Fetching Businesses...
        </>
      ) : (
        "Fetch Businesses"
      )}
    </Button>
  );
}
