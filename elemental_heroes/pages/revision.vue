<!-- pages/index.vue -->
<template>
  <div class="home-page">
    <!-- Top Section -->
    <div class="mb-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="section-title">Announcement</h2>
        <NuxtLink to="/flashcard">
          <button class="btn btn-primary">Upload Notes</button>
        </NuxtLink>
      </div>

      <div class="row g-4">
        <div
          class="col-md-4"
          v-for="note in ['Upload Notes', 'OG Chem', 'Thermodynamics']"
          :key="note"
        >
          <div class="card custom-card">
            <div class="card-body">
              <h5 class="card-title">{{ note }}</h5>
              <p class="card-text text-muted">Uploaded: 2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Shared Flashcards Section -->
    <div class="mb-5">
      <h2 class="section-title">Shared Flashcards</h2>
      <div class="row g-4">
        <div
          class="col-md-4"
          v-for="deck in ['OG Chem', 'Thermodynamics']"
          :key="deck"
        >
          <div class="card custom-card">
            <div class="card-body">
              <h5 class="card-title">{{ deck }}</h5>
              <p class="card-text text-muted">32 cards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
//for supabase queries
</script>

<style scoped>
.home-page {
  padding: 20px;
}


.custom-card {
  background-color: #ffffff; /* White background for contrast */
  border: px solid #e0e0e0; /* Light border */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  transition: transform 0.2s, box-shadow 0.2s; /* Smooth transition for hover effect */
}

.custom-card:hover {
  transform: translateY(-5px); /* Slight lift on hover */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Stronger shadow on hover */
}

.card-title {
  font-weight: bold;
  color: #333; /* Darker text color for better readability */
}

.card-text {
  color: #666; /* Slightly lighter text color for secondary information */
}
</style>
