import "dotenv/config";
import express from "express";
import cors from "cors";
import { ChatOpenAI } from "@langchain/openai";
import { retrieveRelevantMemories, saveMessageToPinecone } from "./langchain.js";
import { getPersonalityPrompt } from "./personalities.js";
import { getPineconeIndex } from "./pinecone.js";

const app = express();
app.use(cors());
app.use(express.json());

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { userId, message, personality = "helpful", history = [] } = req.body;

    if (!userId) throw new Error("Missing userId");

    const memories = await retrieveRelevantMemories(userId, message);
    const memoryText = memories.map((m) => m.pageContent).join("\n");
    const systemPrompt = getPersonalityPrompt(personality);
    const restrictionPrompt = `
    System rules:
    - Do not provide code of any kind.
    - Do not discuss sensitive topics like politics or religion.
    - Do not explain how to perform illegal, harmful, or dangerous actions.
    - Focus only on general, factual, and safe explanations.
    - If the user requests restricted content, politely decline.
    `;

    const msgs = [
      { role: "system", content: restrictionPrompt },
      { role: "system", content: systemPrompt },
    ];
    if (memoryText) {
      msgs.push({
        role: "system",
        content: `The user has told you these facts before. Use them if relevant:\n${memoryText}`,
      });
    }

    history.forEach((h) => msgs.push({ role: h.role, content: h.content }));
    msgs.push({ role: "user", content: message });

    const response = await model.invoke(msgs);
    const reply = response.content;

    // Save messages
    await saveMessageToPinecone({ userId, text: message, role: "user" });
    await saveMessageToPinecone({ userId, text: reply, role: "assistant" });

    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/memory/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const index = await getPineconeIndex();
    const ns = index.namespace("__default__");
    await ns._deleteMany({ userId: { $eq: userId } });

    console.log(`Memory deleted for userId: ${userId}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting memory:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
