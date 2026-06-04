import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
});

const res = await client.chat.completions.create({
  model: "openai/gpt-4.1",
  messages: [
    {
      role: "user",
      content: "Buatkan contoh kode JavaScript sederhana.",
    },
  ],
});

console.log(res.choices[0].message.content);