<template>
  <div class="notes-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>{{ noteName }}</h1>
      <div class="d-flex gap-2">
        <NuxtLink :to="{ path: '/flashcard', query: { name: noteName } }">
          <button class="btn btn-primary">Generate Flashcards</button>
        </NuxtLink>
        <button @click="handleDelete" class="btn btn-danger">Delete</button>
      </div>
    </div>
    <div class="d-flex justify-content-center mb-4">
      <iframe
        v-if="noteUrl"
        class="d2l-fileviewer-rendered-pdf"
        scrolling="no"
        seamless="seamless"
        :src="noteUrl"
        style="width: 80%; height: 651px"
      >
      </iframe>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { createClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from "#app";

const config = useRuntimeConfig();
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseKey
);
const route = useRoute();
const router = useRouter();
const noteName = route.query.name;
const noteUrl = ref(null);

async function getPDF() {
  const { data, error } = await supabase.storage
    .from("files_wad2")
    .getPublicUrl(`user_pdfs/${noteName}.pdf`);
  if (data) {
    noteUrl.value = data.publicUrl;
    console.log(noteUrl.value);
  }
}

async function handleDelete() {
  try {
    // Show confirmation dialog
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    // Delete the file from storage
    const { error } = await supabase.storage
      .from("files_wad2")
      .remove([`user_pdfs/${noteName}.pdf`]);

    if (error) {
      throw error;
    }

    // If deletion is successful, navigate back to the previous page or home
    alert("Note deleted successfully");
    router.push("/revision"); // Adjust this route according to your navigation needs
  } catch (error) {
    console.error("Error deleting note:", error);
    alert("Failed to delete note. Please try again.");
  }
}

onMounted(() => {
  getPDF();
});
</script>

<style scoped>
.notes-page {
  padding: 20px;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
