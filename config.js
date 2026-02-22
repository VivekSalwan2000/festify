// This is a placeholder configuration file
// Actual API keys are stored in Firebase and fetched at runtime

const config = {
  // We only keep the Firebase API key here as it's needed to initialize Firebase
  // All other keys are stored in the Firebase database for better security
  FIREBASE_API_KEY: "AIzaSyCuCieOzwg6VGQIr9jaB5ka-v65shZFR-U",
  
  // These placeholders get replaced with values from Firebase
  EMAIL_SERVICE_ID: null,
  EMAIL_PUBLIC_KEY: null,
  OPENAI_API_KEY: null,
  GOOGLE_MAPS_API_KEY: null
};

export { config };