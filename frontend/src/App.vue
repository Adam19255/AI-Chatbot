<script setup>
import { ref } from "vue";
const messages = ref([]);
const input = ref("");
const personality = ref("helpful");

async function send() {
  const text = input.value.trim();
  if (!text) return;

  messages.value.push({ role: "user", content: text });
  input.value = "";

  const res = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "adam", // later: real auth
      message: text,
      personality: personality.value,
      history: messages.value.slice(-6), // send last turns for short-term
    }),
  });
  const data = await res.json();
  messages.value.push({ role: "assistant", content: data.reply });
}
</script>

<template>
  <div class="chat">
    <select v-model="personality">
      <option value="helpful">Helpful</option>
      <option value="funny">Funny</option>
      <option value="formal">Formal</option>
    </select>

    <div class="messages">
      <div v-for="(m, i) in messages" :key="i" :class="m.role">
        <strong>{{ m.role }}:</strong> {{ m.content }}
      </div>
    </div>

    <input v-model="input" @keyup.enter="send" placeholder="Type..." />
    <button @click="send">Send</button>
  </div>
</template>
