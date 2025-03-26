const API_URL = `https://language.googleapis.com/v2/documents:classifyText?key=${process.env.EXPO_PUBLIC_google}`;

export const classifyText = async (text: string): Promise<string> => {
  // console.log(API_URL);
  if (text.length < 20) {
    return "Text too short"; // API requires at least 20 characters
  }

  const requestBody = {
    document: {
      type: "PLAIN_TEXT",
      content: text,
    },
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const categories = data.categories || [];
    let matchedBucket = "Other";

    // Map Google’s categories to your custom ones
    if (categories.length > 0) {
      const categoryName = categories[0].name?.toLowerCase() || "";

      // Entertainment & Culture
      if (
        categoryName.includes("arts") ||
        categoryName.includes("entertainment") ||
        categoryName.includes("music") ||
        categoryName.includes("performing") ||
        categoryName.includes("festival") ||
        categoryName.includes("hobbies") ||
        categoryName.includes("leisure")
      ) {
        matchedBucket = "Entertainment & Culture";
      }
      // Sports & Activities
      else if (
        categoryName.includes("sports") ||
        categoryName.includes("game") ||
        categoryName.includes("recreation") ||
        categoryName.includes("fitness")
      ) {
        matchedBucket = "Sports & Activities";
      }
      // News & Incidents
      else if (
        categoryName.includes("news") ||
        categoryName.includes("law") ||
        categoryName.includes("government") ||
        categoryName.includes("politics") ||
        categoryName.includes("safety") ||
        categoryName.includes("accident") ||
        categoryName.includes("crash") ||
        categoryName.includes("protest")
      ) {
        matchedBucket = "News & Incidents";
      }
      // Food & Social
      else if (
        categoryName.includes("food") ||
        categoryName.includes("drink") ||
        categoryName.includes("restaurant") ||
        categoryName.includes("cooking") ||
        categoryName.includes("people") ||
        categoryName.includes("society") ||
        categoryName.includes("social") ||
        categoryName.includes("market")
      ) {
        matchedBucket = "Food & Social";
      }
      // Travel & Environment
      else if (
        categoryName.includes("travel") ||
        categoryName.includes("transportation") ||
        categoryName.includes("traffic") ||
        categoryName.includes("weather") ||
        categoryName.includes("environment") ||
        categoryName.includes("destination")
      ) {
        matchedBucket = "Travel & Environment";
      }
    }

    return matchedBucket;
  } catch (error) {
    console.error("Error classifying text:", error);
    return "Other";
  }
};
