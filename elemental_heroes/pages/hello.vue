<template>
  <div class="container">
    <h1>API Test</h1>
    <button @click="fetchMessage" class="btn btn-primary">Get Message</button>
    <p v-if="message"><strong>Response:</strong> {{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const message = ref("");

const fetchMessage = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:5000/api/hello");
    message.value = response.data.message;
  } catch (error) {
    console.error("API call failed:", error);
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
}
</style>
