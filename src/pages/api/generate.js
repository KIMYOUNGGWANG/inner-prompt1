import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { emotion } = req.body;

  if (!emotion) {
    return res.status(400).json({ error: 'Emotion is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates journal prompts based on emotions. Generate 3 thoughtful and reflective prompts that help users explore their feelings."
        },
        {
          role: "user",
          content: `Generate 3 journal prompts for someone feeling ${emotion}.`
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const prompts = completion.choices[0].message.content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim());

    res.status(200).json({ prompts });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to generate prompts' });
  }
} 