"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useBusinessContext } from "@/contexts/BusinessContext";

export default function FetchBusinessesButton({ hexagonId }) {
  const [isLoading, setIsLoading] = useState(false);
  const { createHexagonBusinesses } = useBusinessContext();

  const handleFetch = async () => {
    try {
      setIsLoading(true);
      const data = await createHexagonBusinesses(hexagonId);
      if (!data) {
        throw new Error("Failed to fetch businesses");
      }
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
