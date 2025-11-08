<script setup></script>

<template>
  <div class="settings-modal" @click.stop>
    <svg
      class="modal-close"
      @click="$emit('close')"
      viewBox="-0.5 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#ffffff">
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M3 21.32L21 3.32001"
          stroke="#ffffff"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"></path>
        <path
          d="M3 3.32001L21 21.32"
          stroke="#ffffff"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"></path>
      </g>
    </svg>
    <div class="description">
      <h2>Delete saved memory?</h2>
      <p>This will delete all the saved memory in pinecone.</p>
    </div>
    <div class="action-buttons">
      <button class="delete-button" @click="$emit('delete-memory')">Delete</button>
      <button class="cancel-button" @click="$emit('close')">Cancel</button>
    </div>
  </div>
</template>
