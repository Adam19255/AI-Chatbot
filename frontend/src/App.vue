<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const messages = ref([]);
const input = ref("");
const personality = ref("helpful");
const userId = ref("");
const loading = ref(false);

// Generate or reuse a unique userId
onMounted(() => {
  let savedId = localStorage.getItem("userId");
  if (!savedId) {
    savedId = crypto.randomUUID(); // built-in browser function
    localStorage.setItem("userId", savedId);
    console.log("Generated new userId:", savedId);
  } else {
    console.log("Loaded existing userId:", savedId);
  }
  userId.value = savedId;
});

// Send message with user-specific ID
async function send() {
  loading.value = true;
  const text = input.value.trim();
  if (!text) return;

  // Add the user message to local display
  messages.value.push({ role: "user", content: text });
  input.value = "";

  try {
    const res = await axios.post("http://localhost:3000/chat", {
      userId: userId.value,
      message: text,
      personality: personality.value,
      history: messages.value.slice(-6),
    });

    messages.value.push({ role: "assistant", content: res.data.reply });
  } catch (error) {
    console.error("Chat error:", err);
    let msg = "Error: unable to reach the server.";
    if (err.response) {
      msg = `Server error (${err.response.status}): ${err.response.data.error || "Unknown error"}`;
    } else if (err.request) {
      msg = "Network error: no response received from server.";
    }
    messages.value.push({ role: "assistant", content: msg });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="chat">
    <select v-model="personality" class="personality">
      <option value="helpful">Helpful</option>
      <option value="funny">Funny</option>
      <option value="formal">Formal</option>
    </select>

    <div class="messages">
      <div v-for="(m, i) in messages" :key="i" :class="['message', m.role]">
        {{ m.content }}
      </div>

      <svg
        v-if="loading"
        class="loading-svg"
        fill="#ffffff"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        stroke="#ffffff">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier"><path d="M12 18a6 6 0 100-12 6 6 0 000 12z"></path></g>
      </svg>
    </div>

    <div class="input-area">
      <input v-model="input" @keyup.enter="send" placeholder="Type your message..." />
      <svg @click="send" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ccc">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M18.455 9.8834L7.063 4.1434C6.76535 3.96928 6.40109 3.95274 6.08888 4.09916C5.77667 4.24558 5.55647 4.53621 5.5 4.8764C5.5039 4.98942 5.53114 5.10041 5.58 5.2024L7.749 10.4424C7.85786 10.7903 7.91711 11.1519 7.925 11.5164C7.91714 11.8809 7.85789 12.2425 7.749 12.5904L5.58 17.8304C5.53114 17.9324 5.5039 18.0434 5.5 18.1564C5.55687 18.4961 5.77703 18.7862 6.0889 18.9323C6.40078 19.0785 6.76456 19.062 7.062 18.8884L18.455 13.1484C19.0903 12.8533 19.4967 12.2164 19.4967 11.5159C19.4967 10.8154 19.0903 10.1785 18.455 9.8834V9.8834Z"
            stroke="#ccc"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"></path>
        </g>
      </svg>
    </div>
  </div>
</template>
