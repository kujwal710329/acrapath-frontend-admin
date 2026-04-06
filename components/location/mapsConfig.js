// Stable references — must be module-level so useJsApiLoader never re-initializes
export const MAPS_LIBRARIES = ["places"];
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
