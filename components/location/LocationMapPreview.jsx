"use client";

import { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { MAPS_LIBRARIES, GOOGLE_MAPS_API_KEY } from "./mapsConfig";

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "200px",
  borderRadius: "12px",
};

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
};

/**
 * Shows an embedded Google Map with a marker at the given coordinates.
 * Fades in smoothly after mount. Renders nothing until a valid location is provided.
 *
 * Props:
 *   lat          {number}   Latitude of the pin
 *   lng          {number}   Longitude of the pin
 *   onChangeLoc  {function} Called when user clicks "Change location"
 */
export default function LocationMapPreview({ lat, lng, onChangeLoc }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: MAPS_LIBRARIES,
  });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lat != null && lng != null) {
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [lat, lng]);

  if (!isLoaded || lat == null || lng == null) return null;

  return (
    <div
      className="mt-4 overflow-hidden rounded-xl"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
    >
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={{ lat, lng }}
        zoom={15}
        options={MAP_OPTIONS}
      >
        <Marker position={{ lat, lng }} />
      </GoogleMap>

      {onChangeLoc && (
        <button
          type="button"
          onClick={onChangeLoc}
          className="mt-2 text-xs font-medium text-(--color-primary) hover:underline"
        >
          Change location
        </button>
      )}
    </div>
  );
}
