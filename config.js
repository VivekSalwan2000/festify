/**
 * Bootstrap configuration for Firebase initialization.
 * The Firebase web API key is required here to start the app; other service keys
 * are loaded at runtime from Firestore (config/apiKeys) via firebase.js.
 */
const config = {
  FIREBASE_API_KEY: "AIzaSyCuCieOzwg6VGQIr9jaB5ka-v65shZFR-U",
  EMAIL_SERVICE_ID: null,
  EMAIL_PUBLIC_KEY: null,
  OPENAI_API_KEY: null,
  GOOGLE_MAPS_API_KEY: null
};

export { config };
