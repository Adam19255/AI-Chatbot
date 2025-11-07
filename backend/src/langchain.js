import "dotenv/config";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeIndex } from "./pinecone.js";

// Get or create vector store
export async function getVectorStore() {
  const index = await getPineconeIndex();
  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
  });
}

// Store only user messages (not assistant replies)
export async function saveMessageToPinecone({ userId, text, role }) {
  if (role !== "user") return;

  const store = await getVectorStore();
  await store.addDocuments([
    {
      pageContent: text,
      metadata: { userId },
    },
  ]);
}

// Retrieve only that user's memory
export async function retrieveRelevantMemories(userId, query) {
  const store = await getVectorStore();
  const results = await store.similaritySearch(query, 5, { userId });
  return results;
}
