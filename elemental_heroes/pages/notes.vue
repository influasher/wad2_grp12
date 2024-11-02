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
        :src="noteUrl"
        style="width: 80%; height: 651px"
      >
      </iframe>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

import { createClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from "#app";

const config = useRuntimeConfig();
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseKey
);
const route = useRoute();
const noteName = route.query.name; // Retrieve the `name` query parameter
const noteUrl = ref(null);

async function getPDF() {
  const { data, error } = await supabase.storage
    .from("files_wad2")
    .getPublicUrl(`user_pdfs/` + noteName + ".pdf");
  if (data) {
    noteUrl.value = data.publicUrl;
    console.log(noteUrl.value);
  }
}

onMounted(() => {
  getPDF();
});
=======

</script>

<style scoped>
.notes-page {
  padding: 20px;
}
</style>
