import express from 'express';
import 'dotenv/config';

const app = express();
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message, conversationId } = req.body;

  const response = await fetch('https://api.dify.ai/v1/chat-messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {},
      query: message,
      response_mode: 'blocking',
      conversation_id: conversationId || '',
      user: 'web-app-user',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Dify API error:', err);
    return res.status(response.status).json({ error: err });
  }

  const data = await response.json();
  res.json({
    answer: data.answer,
    conversationId: data.conversation_id,
  });
});

app.listen(3001, () => console.log('Proxy server: http://localhost:3001'));
