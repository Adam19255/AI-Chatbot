# AI Chatbot with Memory

An interactive AI chatbot built with **Vue.js (frontend)** and **Node.js (backend)** that remembers previous conversations using **LangChain** and **Pinecone**.  
Supports multiple users, selectable personalities, and message-based memory storage.

---

## 🚀 Features

- 🧠 **Persistent Memory** – Stores user messages in Pinecone so the bot remembers context across sessions.
- 👥 **Multiple Users** – Each user gets their own isolated memory space (auto-generated UUID).
- 🎭 **Personalities** – Switch between _helpful_, _funny_, and _formal_ response styles.
- 💬 **Conversation History** – Keeps short-term memory for local continuity (`last 6 messages`).
- 🔒 **Safety Rules** – Restricts AI behavior (e.g., no code output).
- 🧩 **Modular Code** – Clean separation of backend and frontend, easy to extend.

---

## 🏗️ Tech Stack

| Area                 | Technology                      |
| -------------------- | ------------------------------- |
| **Frontend**         | Vue.js (Vite) + Axios           |
| **Backend**          | Node.js + Express               |
| **AI Engine**        | OpenAI GPT-4 (via LangChain)    |
| **Memory**           | Pinecone Vector Database        |
| **Vector Dimension** | 1536 (`text-embedding-3-small`) |
| **UI/UX**            | Custom CSS                      |

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/ai-chatbot-with-memory.git
cd ai-chatbot-with-memory
```

### 2️⃣ Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 3️⃣ Environment Variables

#### Create a .env file inside the backend folder:

```bash
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=chatbot-memories
PORT=3000
```

### 4️⃣ Run the Servers

#### Backend

```bash
cd backend
npm run dev
```

Server runs on: http://localhost:3000

#### Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:5173

---

## 💬 How It Works

1. Each user gets a **unique userId** (stored in `localStorage`).
2. When a message is sent:
   - The last 6 messages (short-term context) are sent to the backend.
   - LangChain uses OpenAI embeddings to encode the new message.
   - Pinecone searches for similar past vectors (long-term memory).
   - The most relevant past facts are injected into the GPT prompt.
   - The AI generates a response according to the chosen personality.
   - The user message (and optionally reply) are stored in Pinecone.

🧠 **Short-term memory:** Maintained locally (recent 6 messages).  
🗄️ **Long-term memory:** Stored in Pinecone, retrieved via semantic similarity.

---

## 🔒 Restrictions & Safety

This chatbot includes a **global restriction layer** defined in `server.js`:

```js
const restrictionPrompt = `
You are a helpful assistant, but you must follow these restrictions:
- Do NOT provide or generate any code snippets or pseudocode.
- Do NOT include Markdown code blocks or language names.
- If a user asks for code, politely refuse and explain conceptually instead.
`;
```

🛡️ You can modify or expand this section to restrict other behaviors.
