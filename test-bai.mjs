import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.BAI_API_KEY,
  baseURL: "https://api.b.ai/v1",
});

const completion = await client.chat.completions.create({
  model: "gpt-5-mini",
  messages: [
    {
      role: "user",
      content: "Jelaskan API key itu apa dengan bahasa sederhana.",
    },
  ],
  max_tokens: 300,
  temperature: 0.7,
});

console.log(completion.choices[0].message.content);