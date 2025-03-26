const API_URL = `https://language.googleapis.com/v2/documents:classifyText?key=${process.env.EXPO_PUBLIC_google}`;

export const classifyText = async (text: string): Promise<string> => {
  // Custom categories
  const customCategories = ["Traffic", "Safety", "Event", "Infrastructure", "General"];
    console.log(API_URL);
  if (text.length < 20) {
    return 'Text too short'; // API requires at least 20 characters
  }

  const requestBody = {
    document: {
      type: 'PLAIN_TEXT',
      content: text,
    },
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const categories = data.categories || [];
    let matchedCategory = 'General';

    // Map Google’s categories to your custom ones
    for (const cat of categories) {
      const name = cat.name?.toLowerCase() || '';
      if (name.includes('traffic')) matchedCategory = 'Traffic';
      else if (name.includes('safety')) matchedCategory = 'Safety';
      else if (name.includes('food')) matchedCategory = 'Event';
      else if (name.includes('infrastructure')) matchedCategory = 'Infrastructure';
      else if (name.includes('General')) matchedCategory = 'General';
      if (matchedCategory !== 'General') break;
    }

    return matchedCategory;
  } catch (error) {
    console.error('Error classifying text:', error);
    return 'Unknown';
  }
};