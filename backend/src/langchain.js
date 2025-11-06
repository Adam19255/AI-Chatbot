import "dotenv/config";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeIndex } from "./pinecone.js";
import { RunnableSequence } from "@langchain/core/runnables";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getPersonalityPrompt } from "./personalities.js";

export async function getVectorStore() {
  const index = await getPineconeIndex();
  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const store = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
  });
  return store;
}

export async function saveMessageToPinecone({ userId, text, role }) {
  const store = await getVectorStore();
  await store.addDocuments([
    {
      pageContent: text,
      metadata: { userId, role, ts: Date.now() },
    },
  ]);
}

export async function retrieveRelevantMemories(userId, query) {
  const store = await getVectorStore();
  const results = await store.similaritySearch(query, 4, {
    userId, // filter, depends on index metadata config
  });
  return results;
}
