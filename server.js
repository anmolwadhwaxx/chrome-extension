const express = require('express');
const axios = require('axios');
const cors = require('cors');
const debug = require('debug')('app');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/analyze', async (req, res) => {
  const { text } = req.body;

  // Check if text is provided and is a string
  if (typeof text !== 'string' || text.trim() === '') {
    debug('Invalid input: Text is undefined or not a string');
    return res.status(400).send('Bad Request: Invalid text input.');
  }

  debug(`Received text: ${text}`);

  try {
    // Determine if the text is likely code
    const isCode = /[{}();]/.test(text) || text.includes('function') || text.includes('class');

    // Choose prompt based on text type
    const prompt = isCode
      ? `Explain the following code snippet: ${text}`
      : `Explain the following text: ${text}`;

    // Call OpenAI API with gpt-3.5-turbo model
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant who provides context and explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300, // Increase max tokens to allow for longer responses
      temperature: 0.2, // Low temperature for more deterministic output
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer <api-key>` // Replace with your actual API key
      }
    });

    debug('OpenAI response:', response.data);
    res.json({ analysis: response.data.choices[0].message.content.trim() });
  } catch (error) {
    debug('Error during API request:', error.response ? error.response.data : error.message);
    console.error('Error during API request:', error.response ? error.response.data : error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  debug(`Server is running on port ${PORT}`);
  console.log(`Server is running on port ${PORT}`);
});
