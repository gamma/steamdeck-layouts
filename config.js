// Proxy used when the app is not served from localhost (e.g. GitHub Pages).
// Point this at the deployed proxy/api.php, e.g. "https://example.com/sdl-api/api.php".
// Viewers can override it with ?api=<url> (persisted) and reset with ?api=default.
export const REMOTE_API_BASE = "https://sdl.gammaproduction.de/api/api.php";

// Proxy used when the app runs locally via `node server.js`.
export const LOCAL_API_BASE = "./api";
