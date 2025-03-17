"use client";

import { useState } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { Search } from "lucide-react";

export default function MapSearch({ onSelectLocation }) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    cache: 24 * 60 * 60,
  });

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();
    setIsOpen(false);

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      onSelectLocation({ lat, lng });
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-96 max-w-[calc(100%-2rem)]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setIsOpen(true);
          }}
          disabled={!ready}
          placeholder="Search locations..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {isOpen && status === "OK" && (
        <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
              <button
                key={place_id}
                onClick={() => handleSelect(suggestion.description)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                <div className="font-medium">{main_text}</div>
                <div className="text-sm text-gray-600">{secondary_text}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
