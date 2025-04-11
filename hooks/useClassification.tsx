import { useState, useEffect } from "react";

// API endpoint for Google Cloud Natural Language API
const API_URL = `https://language.googleapis.com/v2/documents:classifyText?key=${process.env.EXPO_PUBLIC_google}`;

// Minimum text length required by the API
const MIN_TEXT_LENGTH = 20;

// Main classification function
export const classifyText = async (text: string): Promise<string> => {
  // Show error if text is too short
  if (!text || text.length < MIN_TEXT_LENGTH) {
    return "General"; // Default category for short text
  }

  try {
    const requestBody = {
      document: {
        type: "PLAIN_TEXT",
        content: text,
      },
    };

    // Make API request
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Check for HTTP errors
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);

      // Check for common errors
      if (response.status === 403) {
        console.error("API key error or quota exceeded");
      } else if (response.status === 400) {
        console.error("Invalid request to the classification API");
      }

      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // If no categories returned, use default
    if (!data.categories || data.categories.length === 0) {
      console.log("No categories returned from API");
      return "General";
    }

    // Extract the top category name
    const topCategory = data.categories[0].name?.toLowerCase() || "";
    console.log("Top category from API:", topCategory);

    // Map the Google category to our app categories
    return mapToAppCategory(topCategory);
  } catch (error) {
    console.error("Error classifying text:", error);
    // Return a safe default on error
    return "General";
  }
};

// Helper function to map Google categories to app categories
function mapToAppCategory(googleCategory: string): string {
  // News & Incidents category
  if (
    containsAny(googleCategory, [
      "news",
      "law",
      "government",
      "politics",
      "safety",
      "emergency",
      "incident",
      "sensitive",
      "violence",
      "abuse",
      "disaster",
      "accident",
      "crash",
      "collision",
      "protest",
      "demonstration",
      "rally",
      "science",
      "earth",
      "jobs",
      "employment",
      "education",
      "school",
      "university",
      "college",
      "police",
      "fire",
      "ambulance",
      "crime",
      "criminal",
      "court",
      "judge",
      "legal",
      "illegal",
      "election",
      "vote",
      "pandemic",
      "outbreak",
      "virus",
      "health crisis",
      "breaking",
      "headline",
      "journalist",
      "reporter",
      "investigation",
      "scandal",
      "corruption",
      "policy",
      "regulation",
      "bill",
      "legislation",
      "senate",
      "congress",
      "parliament",
      "president",
      "governor",
      "mayor",
      "official",
      "authority",
      "public safety",
      "security threat",
    ])
  ) {
    return "News & Incidents";
  }

  // Food & Social category
  if (
    containsAny(googleCategory, [
      "food",
      "drink",
      "restaurant",
      "cooking",
      "recipe",
      "meal",
      "dining",
      "cafe",
      "people",
      "society",
      "social",
      "family",
      "relationships",
      "home",
      "gathering",
      "garden",
      "market",
      "cuisine",
      "chef",
      "bakery",
      "grocery",
      "ingredient",
      "diet",
      "nutrition",
      "healthy eating",
      "vegan",
      "vegetarian",
      "organic",
      "farm",
      "local produce",
      "coffee shop",
      "bar",
      "pub",
      "brewery",
      "winery",
      "cocktail",
      "dessert",
      "brunch",
      "dinner",
      "lunch",
      "breakfast",
      "party",
      "celebration",
      "wedding",
      "community",
      "neighborhood",
      "friendship",
      "dating",
      "romance",
      "parenting",
      "children",
    ])
  ) {
    return "Food & Social";
  }

  // Travel & Environment category
  if (
    containsAny(googleCategory, [
      "travel",
      "transportation",
      "traffic",
      "weather",
      "environment",
      "climate",
      "destination",
      "autos",
      "vehicle",
      "tourism",
      "tour",
      "vacation",
      "holiday",
      "flight",
      "airplane",
      "airport",
      "hotel",
      "resort",
      "beach",
      "mountain",
      "nature",
      "park",
      "forest",
      "ocean",
      "sea",
      "lake",
      "river",
      "cruise",
      "road trip",
      "sightseeing",
      "landmark",
      "attraction",
      "tourist",
      "traveler",
      "backpacking",
      "sustainability",
      "eco-friendly",
      "conservation",
      "pollution",
      "renewable",
      "biodiversity",
      "wildlife",
      "species",
      "ecosystem",
      "natural resources",
      "transit",
      "commute",
      "bus",
      "train",
      "subway",
      "metro",
      "car",
      "driving",
      "road",
      "highway",
      "freeway",
      "bridge",
      "construction",
      "detour",
      "delay",
      "congestion",
      "gasoline",
      "electric vehicle",
      "parking",
      "toll",
      "fare",
      "schedule",
      "route",
    ])
  ) {
    return "Travel & Environment";
  }

  // Entertainment & Culture category
  if (
    containsAny(googleCategory, [
      "arts",
      "entertainment",
      "music",
      "performing",
      "festival",
      "concert",
      "hobbies",
      "leisure",
      "games",
      "gaming",
      "shopping",
      "fashion",
      "movie",
      "film",
      "theater",
      "theatre",
      "exhibition",
      "museum",
      "gallery",
      "dance",
      "internet",
      "telecom",
      "computer",
      "electronics",
      "social media",
      "digital",
      "streaming",
      "performance",
      "artist",
      "band",
      "show",
      "celebrity",
      "culture",
      "cultural",
      "creativity",
      "creative",
      "craft",
      "artwork",
      "media",
      "tv",
      "television",
      "series",
      "book",
      "novel",
      "fiction",
      "comedy",
      "drama",
      "play",
    ])
  ) {
    return "Entertainment & Culture";
  }

  // Sports & Activities category
  if (
    containsAny(googleCategory, [
      "sports",
      "game",
      "recreation",
      "fitness",
      "exercise",
      "workout",
      "athlete",
      "athletic",
      "team",
      "player",
      "match",
      "tournament",
      "championship",
      "competition",
      "racing",
      "running",
      "cycling",
      "swimming",
      "hiking",
      "climbing",
      "outdoor",
      "adventure",
      "gym",
      "training",
      "coach",
      "league",
      "stadium",
      "arena",
      "soccer",
      "football",
      "basketball",
      "baseball",
      "tennis",
      "golf",
      "hockey",
      "sport",
      "sporting",
      "olympics",
      "marathon",
      "triathlon",
      "yoga",
      "pilates",
      "fitness",
    ])
  ) {
    return "Sports & Activities";
  }

  // Default category if no match
  return "General";
}

// Helper function to check if a string contains any of the keywords
function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

// React hook for text classification with auto-classification on text change
export function useClassification(autoClassify = true) {
  const [category, setCategory] = useState<string>("");
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastClassifiedText, setLastClassifiedText] = useState<string>("");
  const [classificationDebounceTimer, setClassificationDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);

  // Function to classify text manually or automatically
  const classify = async (text: string, force = false) => {
    // Skip if text is too short
    if (!text || text.length < MIN_TEXT_LENGTH) {
      setError(`Text must be at least ${MIN_TEXT_LENGTH} characters long`);
      return;
    }

    // Skip if already classifying
    if (isClassifying && !force) return;

    // Skip if the text hasn't changed significantly (save API calls)
    if (
      !force &&
      lastClassifiedText &&
      text.startsWith(lastClassifiedText) &&
      Math.abs(text.length - lastClassifiedText.length) < 20
    ) {
      return;
    }

    setIsClassifying(true);
    setError(null);

    try {
      const result = await classifyText(text);
      setCategory(result);
      setLastClassifiedText(text);
    } catch (err) {
      setError("Classification failed. Please try again.");
      console.error("Classification error:", err);
    } finally {
      setIsClassifying(false);
    }
  };

  // Function to handle text changes with debounce for auto-classification
  const handleTextChange = (text: string) => {
    // Clear any previous debounce timer
    if (classificationDebounceTimer) {
      clearTimeout(classificationDebounceTimer);
    }

    if (!autoClassify || text.length < MIN_TEXT_LENGTH) {
      return;
    }

    // Set new debounce timer (wait 1 second after typing stops)
    const timer = setTimeout(() => {
      classify(text);
    }, 1000);

    setClassificationDebounceTimer(timer);
  };

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (classificationDebounceTimer) {
        clearTimeout(classificationDebounceTimer);
      }
    };
  }, [classificationDebounceTimer]);

  return {
    category,
    isClassifying,
    error,
    classify, // For manual classification
    handleTextChange, // For auto-classification
  };
}
