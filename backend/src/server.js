import "dotenv/config";
import express from "express";
import cors from "cors";
import { ChatOpenAI } from "@langchain/openai";
import { retrieveRelevantMemories, saveMessageToPinecone } from "./langchain.js";
import { getPersonalityPrompt } from "./personalities.js";

const app = express();
app.use(cors());
app.use(express.json());

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { userId = "demo-user", message, personality = "helpful", history = [] } = req.body;

    // 1) retrieve long-term mem
    const memories = await retrieveRelevantMemories(userId, message);

    // 2) build system prompt
    const systemPrompt = getPersonalityPrompt(personality);

    // 3) turn memories into text
    const memoryText = memories.map((m) => m.pageContent).join("\n");

    // 4) build messages array
    const msgs = [{ role: "system", content: systemPrompt }];

    if (memoryText) {
      msgs.push({
        role: "system",
        content: "Relevant past info:\n" + memoryText,
      });
    }

    // add short-term history from frontend (last 5 msgs)
    history.forEach((h) => {
      msgs.push({ role: h.role, content: h.content });
    });

    // current user message
    msgs.push({ role: "user", content: message });

    // 5) call the model
    const response = await model.invoke(msgs);

    const botReply = response.content; // LangChain returns content in a friendly way

    // 6) save both user and assistant message to Pinecone
    await saveMessageToPinecone({ userId, text: message, role: "user" });
    await saveMessageToPinecone({ userId, text: botReply, role: "assistant" });

    res.json({ reply: botReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
