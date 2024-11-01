<!-- pages/revision.vue -->
<template>
  <div class="home-page">
    <!-- Top Section -->
    <div class="mb-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="section-title">My Notes</h2>
        <NuxtLink to="/upload">
          <button class="btn btn-primary">Upload Notes</button>
        </NuxtLink>
      </div>

      <div class="row g-4">
        <div class="col-md-3">  
            <NuxtLink
            to="/flashcard"
            style="text-decoration: none; color: inherit"
          >
            <div class="card custom-card">
                <div class="card-body text-center">
                    <h5 class="card-title">+</h5>
                    <p class="card-text text-muted">
                        Upload Notes
                    </p>
                </div>
            </div>
        </NuxtLink>
        </div>
        <div class="col-md-3" v-for="note in notes" :key="note">
            <!-- Add Nuxtlink to notes page which has pdf viewer -->
            <NuxtLink :to="{ path: '/notes', query: { name: note.name } }"
            style="text-decoration: none;">
            <div class="card custom-card">
              <div class="card-body">
                <h5 class="card-title">{{ note.name }}</h5>
                <p class="card-text text-muted">
                  Uploaded: {{ note.formattedDate }}
                </p>
              </div>
            </div>
        </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Shared Flashcards Section -->
    <div class="mb-5">
      <h2 class="section-title">Shared Flashcards</h2>
      <!-- Show skeleton loader while loading -->
      <NoteFlashcardSkeleton v-if="isLoading" :count="6" />

      <!-- Show actual content when loaded -->
      <div v-else class="row g-4">
        <div
          class="col-md-3"
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
import { createClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from "#app";
import { ref } from "vue";
import NoteFlashcardSkeleton from "~/components/NoteFlashcardSkeleton.vue";
const config = useRuntimeConfig();
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseKey
);
const notes = ref([]);
const isLoading = ref(true); // Add loading state

// Function to fetch and format notes
async function getNotes() {
  try {
    isLoading.value = true; // Set loading to true before fetching
    const { data, error } = await supabase.storage
      .from("files_wad2")
      .list("user_pdfs");

    if (error) {
      console.log("Error fetching notes:", error);
    } else if (data) {
      console.log("Fetched data:", data);

      notes.value = data.map((item) => {
        const nameWithoutExtension = item.name.replace(/\.[^/.]+$/, "");
        const formattedDate = new Date(item.created_at).toLocaleDateString(
          undefined,
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );

        return {
          ...item,
          name: nameWithoutExtension,
          formattedDate,
        };
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    isLoading.value = false; // Set loading to false after fetching
  }
}

onMounted(() => {
  getNotes();
});
</script>

<style scoped>
.home-page {
  padding: 20px;
}

.custom-card {
  background-color: #ffffff; /* White background for contrast */
  height: 150px;
  border: 0.5px solid #e4e3e3; /* Light border */
  border-radius: 8px; /* Rounded corners */
  /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);  */
  /* Subtle shadow for depth */
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
