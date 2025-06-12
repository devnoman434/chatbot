import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const API_TOKEN = process.env.CF_API_TOKEN;
const MODEL_NAME = '@hf/google/gemma-7b-it'; 

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post("https://chatbot-tau-gilt.vercel.app/ask", async (req, res) => {
  const userPrompt = req.body.prompt;
  if (!userPrompt) return res.status(400).json({ success: false, error: "Missing prompt." });

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL_NAME}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: userPrompt })
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(500).json({ success: false, errors: data.errors || ["Unknown error"] });
    }

    res.json({ success: true, response: data.result.response || "[No response]" });

  } catch (err) {
    res.status(500).json({ success: false, errors: [err.message] });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
