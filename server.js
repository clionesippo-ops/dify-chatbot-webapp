import express from 'express';
import 'dotenv/config';
import { Readable } from 'node:stream';

const app = express();
app.use(express.json());

const BOT_API_KEYS = {
  chat: process.env.DIFY_API_KEY_CHAT,
  kondate: process.env.DIFY_API_KEY_KONDATE,
};

app.post('/api/chat', async (req, res) => {
  const { message, conversationId, bot } = req.body;
  const apiKey = BOT_API_KEYS[bot];

  if (!apiKey) {
    return res.status(400).json({ error: `Unknown or unconfigured bot: ${bot}` });
  }

  const response = await fetch('https://api.dify.ai/v1/chat-messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {},
      query: message,
      response_mode: 'streaming',
      conversation_id: conversationId || '',
      user: 'web-app-user',
    }),
  });

  if (!response.ok || !response.body) {
    const err = await response.text();
    console.error('Dify API error:', err);
    return res.status(response.status).json({ error: err });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  Readable.fromWeb(response.body).pipe(res);
});

app.listen(3001, () => console.log('Proxy server: http://localhost:3001'));
