"use client";

import { useState, useRef, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import Label from "@/components/common/Label";
import LocationMapPreview from "./LocationMapPreview";
import { MAPS_LIBRARIES, GOOGLE_MAPS_API_KEY } from "./mapsConfig";

// Matches the design system input styles used across the project
const inputBase =
  "h-14 w-full rounded-xl border px-5 text-[0.9375rem] font-medium outline-none transition-colors placeholder:text-(--color-black-shade-400)";
const inputNormal =
  "border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)";

const SAVED_ADDRESSES_KEY = "savedAddresses";
const MAX_SAVED = 3;

function loadSavedAddresses() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_ADDRESSES_KEY) || "[]").slice(
      0,
      MAX_SAVED
    );
  } catch {
    return [];
  }
}

function saveAddress(entry) {
  try {
    const existing = JSON.parse(
      localStorage.getItem(SAVED_ADDRESSES_KEY) || "[]"
    );
    const updated = [
      entry,
      ...existing.filter((a) => a.placeId !== entry.placeId),
    ].slice(0, MAX_SAVED);
    localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Full-featured location picker with Google Places Autocomplete,
 * "Use my current location", saved addresses, optional floor/plot input,
 * and an embedded map preview.
 *
 * Props:
 *   value    {{ address, placeId, lat, lng, floorPlotShop }}
 *   onChange {function}  Called with the updated location object
 *   error    {string}    Validation error message (highlights search border)
 *   onBlur   {function}  Called when the search input loses focus
 */
export default function WorkingLocationPicker({
  value,
  onChange,
  error,
  onBlur,
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: MAPS_LIBRARIES,
  });

  const [searchInput, setSearchInput] = useState(value?.address || "");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [savedAddresses, setSavedAddresses] = useState(loadSavedAddresses);

  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // ── Google Places Autocomplete ───────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode", "establishment"],
      componentRestrictions: { country: "in" },
      fields: ["place_id", "formatted_address", "geometry"],
    });
    autocompleteRef.current = ac;

    const listener = ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place.geometry) return;

      const loc = {
        address: place.formatted_address,
        placeId: place.place_id,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        floorPlotShop: value?.floorPlotShop || "",
      };

      setSearchInput(place.formatted_address);
      setSavedAddresses(saveAddress({ address: loc.address, placeId: loc.placeId, lat: loc.lat, lng: loc.lng }));
      onChange(loc);
    });

    return () => window.google.maps.event.removeListener(listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleClear = () => {
    setSearchInput("");
    onChange({
      address: "",
      placeId: "",
      lat: null,
      lng: null,
      floorPlotShop: value?.floorPlotShop || "",
    });
    inputRef.current?.focus();
  };

  const handleSavedAddress = (saved) => {
    setSearchInput(saved.address);
    onChange({
      address: saved.address,
      placeId: saved.placeId,
      lat: saved.lat,
      lng: saved.lng,
      floorPlotShop: value?.floorPlotShop || "",
    });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
          );
          const data = await res.json();
          if (data.results?.[0]) {
            const { formatted_address: address, place_id: placeId } =
              data.results[0];
            const loc = {
              address,
              placeId,
              lat,
              lng,
              floorPlotShop: value?.floorPlotShop || "",
            };
            setSearchInput(address);
            setSavedAddresses(saveAddress({ address, placeId, lat, lng }));
            onChange(loc);
          } else {
            setLocationError("Unable to fetch location.");
          }
        } catch {
          setLocationError("Unable to fetch location.");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        setLocationError("Unable to fetch location.");
      }
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Search input with icon + clear button */}
      <div
        className={`flex items-center rounded-xl border transition-colors ${
          error
            ? "border-(--color-red)"
            : "border-(--color-black-shade-300) focus-within:border-(--color-primary)"
        }`}
      >
        <svg
          className="ml-4 shrink-0 text-(--color-black-shade-400)"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            if (!e.target.value)
              onChange({
                address: "",
                placeId: "",
                lat: null,
                lng: null,
                floorPlotShop: value?.floorPlotShop || "",
              });
          }}
          onBlur={onBlur}
          placeholder="Search for your address / locality"
          className="h-14 flex-1 bg-transparent px-3 text-[0.9375rem] font-medium text-(--color-black-shade-900) outline-none placeholder:text-(--color-black-shade-400)"
        />

        {searchInput && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear location"
            className="mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--color-black-shade-100) text-(--color-black-shade-500) transition-colors hover:bg-(--color-black-shade-200)"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Card: current location button + saved addresses */}
      <div className="mt-2 rounded-xl border border-(--color-black-shade-200) bg-white p-3">
        {/* Use my current location */}
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={locationLoading}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-(--color-primary) transition-colors hover:bg-(--color-primary)/5 disabled:opacity-60"
        >
          {locationLoading ? (
            <svg
              className="h-4 w-4 shrink-0 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          )}
          {locationLoading ? "Fetching location…" : "Use my current location"}
        </button>

        {locationError && (
          <p className="mt-1 px-2 text-xs text-(--color-red)">{locationError}</p>
        )}

        {/* Saved addresses */}
        {savedAddresses.length > 0 && (
          <div className="mt-2 border-t border-(--color-black-shade-100) pt-2">
            <p className="mb-1 px-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-(--color-black-shade-400)">
              Saved Addresses
            </p>
            {savedAddresses.map((saved, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSavedAddress(saved)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-(--color-black-shade-700) transition-colors hover:bg-(--color-black-shade-50)"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-(--color-black-shade-400)"
                  aria-hidden="true"
                >
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="truncate">{saved.address}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floor / Plot / Shop No. (optional) */}
      <div className="mt-4">
        <Label>Add Floor / Plot No. / Shop No. (optional)</Label>
        <input
          type="text"
          value={value?.floorPlotShop || ""}
          onChange={(e) => onChange({ ...value, floorPlotShop: e.target.value })}
          placeholder="Enter office floor / plot no. / shop no. (optional)"
          className={`${inputBase} ${inputNormal}`}
        />
      </div>

      {/* Map preview */}
      <LocationMapPreview
        lat={value?.lat}
        lng={value?.lng}
        onChangeLoc={() => inputRef.current?.focus()}
      />
    </div>
  );
}
