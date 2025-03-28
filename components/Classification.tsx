const API_URL = `https://language.googleapis.com/v2/documents:classifyText?key=${process.env.EXPO_PUBLIC_google}`;

export const classifyText = async (text: string): Promise<string> => {
  // console.log(API_URL);
  if (text.length < 20) {
    return "Alert! Text too short"; // API requires at least 20 characters
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
      console.log(categoryName);
      // Entertainment & Culture
      if (
        categoryName.includes("arts") ||
        categoryName.includes("entertainment") ||
        categoryName.includes("music") ||
        categoryName.includes("performing") ||
        categoryName.includes("festival") ||
        categoryName.includes("hobbies") ||
        categoryName.includes("leisure") ||
        categoryName.includes("games") ||
        categoryName.includes("shopping") ||
        categoryName.includes("fashion") ||
        categoryName.includes("internet") ||
        categoryName.includes("telecom") ||
        categoryName.includes("computer") ||
        categoryName.includes("electronics") ||
        categoryName.includes("social media")
      ) {
        matchedBucket = "Entertainment & Culture";
      }
      // Sports & Activities
      else if (
        categoryName.includes("sports") ||
        categoryName.includes("game") ||
        categoryName.includes("recreation") ||
        categoryName.includes("fitness") ||
        categoryName.includes("exercise")
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
        categoryName.includes("sensitive") ||
        categoryName.includes("violence") ||
        categoryName.includes("abuse") ||
        categoryName.includes("disaster") ||
        categoryName.includes("accident") ||
        categoryName.includes("crash") ||
        categoryName.includes("protest") ||
        categoryName.includes("science") ||
        categoryName.includes("earth") ||
        categoryName.includes("jobs") ||
        categoryName.includes("education")
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
        categoryName.includes("family") ||
        categoryName.includes("relationships") ||
        categoryName.includes("home") ||
        categoryName.includes("garden") ||
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
        categoryName.includes("destination") ||
        categoryName.includes("autos") ||
        categoryName.includes("vehicle") ||
        categoryName.includes("finance")
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
