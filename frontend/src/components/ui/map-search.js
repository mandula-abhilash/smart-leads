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
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setIsOpen(true);
          }}
          disabled={!ready}
          placeholder="Search locations..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500"
        />
      </div>

      {isOpen && status === "OK" && (
        <div className="absolute w-full mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 max-h-[300px] overflow-auto z-50">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
              <button
                key={place_id}
                onClick={() => handleSelect(suggestion.description)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50/80 focus:outline-none focus:bg-gray-50/80 transition-colors duration-200"
              >
                <div className="font-medium text-gray-900">{main_text}</div>
                <div className="text-sm text-gray-600">{secondary_text}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
