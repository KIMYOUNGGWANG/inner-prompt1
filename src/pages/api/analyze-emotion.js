import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { answer } = req.body;
  if (!answer) {
    return res.status(400).json({ error: 'Answer is required' });
  }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that extracts the main emotion from a journal entry. Reply with only one English emotion word (e.g., Happy, Sad, Angry, Calm, Anxious, Love, Lonely, Frustrated, Grateful, Tired).'
        },
        {
          role: 'user',
          content: `Journal entry: ${answer}`
        }
      ],
      temperature: 0.2,
      max_tokens: 10,
    });
    const emotion = completion.choices[0].message.content.trim().split(/\s|\.|,|!|\?/)[0];
    res.status(200).json({ emotion });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to analyze emotion' });
  }
} 