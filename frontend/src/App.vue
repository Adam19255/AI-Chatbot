<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Settings from "./components/Settings.vue";

const messages = ref([]);
const input = ref("");
const personality = ref("helpful");
const userId = ref("");
const loading = ref(false);
const showSettingsModal = ref(false);

// Generate or reuse a unique userId
onMounted(() => {
  let savedId = localStorage.getItem("userId");
  if (!savedId) {
    savedId = crypto.randomUUID();
    localStorage.setItem("userId", savedId);
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

function closeModal() {
  showSettingsModal.value = false;
}

async function deleteUserMemory() {
  try {
    await axios.delete(`http://localhost:3000/memory/${userId.value}`);
    alert("User memory deleted successfully!");
  } catch (err) {
    console.error("Failed to delete memory:", err);
    alert("Failed to delete memory.");
  } finally {
    closeModal();
    messages.value = [];
  }
}
</script>

<template>
  <div :class="['overlay', { active: showSettingsModal }]" @click="closeModal"></div>
  <div class="chat">
    <div class="header">
      <div class="personality">
        <p>Personality:</p>
        <select v-model="personality">
          <option value="helpful">Helpful</option>
          <option value="funny">Funny</option>
          <option value="formal">Formal</option>
        </select>
      </div>
      <svg
        class="settings"
        @click="showSettingsModal = true"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="#ffffff">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <circle cx="12" cy="12" r="3" stroke="#ffffff" stroke-width="1.5"></circle>
          <path
            d="M13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.74457 2.35523 9.35522 2.74458 9.15223 3.23463C9.05957 3.45834 9.0233 3.7185 9.00911 4.09799C8.98826 4.65568 8.70226 5.17189 8.21894 5.45093C7.73564 5.72996 7.14559 5.71954 6.65219 5.45876C6.31645 5.2813 6.07301 5.18262 5.83294 5.15102C5.30704 5.08178 4.77518 5.22429 4.35436 5.5472C4.03874 5.78938 3.80577 6.1929 3.33983 6.99993C2.87389 7.80697 2.64092 8.21048 2.58899 8.60491C2.51976 9.1308 2.66227 9.66266 2.98518 10.0835C3.13256 10.2756 3.3397 10.437 3.66119 10.639C4.1338 10.936 4.43789 11.4419 4.43786 12C4.43783 12.5581 4.13375 13.0639 3.66118 13.3608C3.33965 13.5629 3.13248 13.7244 2.98508 13.9165C2.66217 14.3373 2.51966 14.8691 2.5889 15.395C2.64082 15.7894 2.87379 16.193 3.33973 17C3.80568 17.807 4.03865 18.2106 4.35426 18.4527C4.77508 18.7756 5.30694 18.9181 5.83284 18.8489C6.07289 18.8173 6.31632 18.7186 6.65204 18.5412C7.14547 18.2804 7.73556 18.27 8.2189 18.549C8.70224 18.8281 8.98826 19.3443 9.00911 19.9021C9.02331 20.2815 9.05957 20.5417 9.15223 20.7654C9.35522 21.2554 9.74457 21.6448 10.2346 21.8478C10.6022 22 11.0681 22 12 22C12.9319 22 13.3978 22 13.7654 21.8478C14.2554 21.6448 14.6448 21.2554 14.8477 20.7654C14.9404 20.5417 14.9767 20.2815 14.9909 19.902C15.0117 19.3443 15.2977 18.8281 15.781 18.549C16.2643 18.2699 16.8544 18.2804 17.3479 18.5412C17.6836 18.7186 17.927 18.8172 18.167 18.8488C18.6929 18.9181 19.2248 18.7756 19.6456 18.4527C19.9612 18.2105 20.1942 17.807 20.6601 16.9999C21.1261 16.1929 21.3591 15.7894 21.411 15.395C21.4802 14.8691 21.3377 14.3372 21.0148 13.9164C20.8674 13.7243 20.6602 13.5628 20.3387 13.3608C19.8662 13.0639 19.5621 12.558 19.5621 11.9999C19.5621 11.4418 19.8662 10.9361 20.3387 10.6392C20.6603 10.4371 20.8675 10.2757 21.0149 10.0835C21.3378 9.66273 21.4803 9.13087 21.4111 8.60497C21.3592 8.21055 21.1262 7.80703 20.6602 7C20.1943 6.19297 19.9613 5.78945 19.6457 5.54727C19.2249 5.22436 18.693 5.08185 18.1671 5.15109C17.9271 5.18269 17.6837 5.28136 17.3479 5.4588C16.8545 5.71959 16.2644 5.73002 15.7811 5.45096C15.2977 5.17191 15.0117 4.65566 14.9909 4.09794C14.9767 3.71848 14.9404 3.45833 14.8477 3.23463C14.6448 2.74458 14.2554 2.35523 13.7654 2.15224Z"
            stroke="#ffffff"
            stroke-width="1.5"></path>
        </g>
      </svg>
    </div>

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
      <input v-model="input" @keyup.enter="send" placeholder="Ask me something" :disabled="loading" />
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

    <Settings v-if="showSettingsModal" @close="closeModal" @delete-memory="deleteUserMemory" />
  </div>
</template>
