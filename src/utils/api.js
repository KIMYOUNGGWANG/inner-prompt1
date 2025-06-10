export async function generatePrompts(emotion) {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emotion }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate prompts');
    }

    const data = await response.json();
    return data.prompts;
  } catch (error) {
    console.error('Error generating prompts:', error);
    throw error;
  }
} 