import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const API_TOKEN = process.env.CF_API_TOKEN;
const MODEL_NAME = '@cf/google/gemma-7b-it-lora'; 

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post("/ask", async (req, res) => {
  const userPrompt = req.body.prompt;
  if (!userPrompt) {
    return res.status(400).json({ success: false, error: "Missing prompt." });
  }

  // Convert to lowercase for comparison
  const promptLower = userPrompt.toLowerCase();

  // Check for custom trigger phrases
  const creatorQuestions = [
    "who made you",
    "who created you",
    "who is your creator",
    "who built you",
    "who developed you"
  ];

if (creatorQuestions.some(q => promptLower.includes(q))) {
  // Wait 2 seconds before responding
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return res.json({
    success: true,
    response: "I was created by Noman — a passionate developer 🚀"
  });
}


  // Otherwise call Cloudflare AI
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
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Serving static files from ${path.join(__dirname, 'public')}`);
});
