<template>
    <div class="notes-page">
        <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>{{ noteName }}</h1>
        <NuxtLink :to="{ path: '/flashcard', query: { name: noteName } }">
          <button class="btn btn-primary">Generate Flashcards</button>
        </NuxtLink>
      </div>
    <div class="d-flex justify-content-center mb-4">
        <iframe 
            class="d2l-fileviewer-rendered-pdf" 
            scrolling="no" 
            seamless="seamless" 
            src="/assets/Session9.Stock Valuation.pdf"
            style="width: 80%; height: 651px;">
        </iframe>
    </div>
    </div>


</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
const noteName = route.query.name; // Retrieve the `name` query parameter
</script>

<style scoped>
.notes-page {
  padding: 20px;
}
</style>