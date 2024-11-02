<template>
    <div class="notes-page">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>{{ noteName }}</h1>
          <button class="btn btn-primary" @click="generateFlashcards">
            Generate Flashcards
          </button>
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
import { createClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from "#app";

const config = useRuntimeConfig();
const route = useRoute();
const router = useRouter();
const noteName = route.query.name;

const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
);

const generateFlashcards = async () => {
    try {
        // Get the file ID from storage
        const { data: fileData, error: fileError } = await supabase.storage
            .from("files_wad2")
            .list(`user_pdfs`, {
                search: noteName
            });

        if (fileError) throw fileError;
                
        // Navigate to flashcard page with the file information
        router.push({
            path: '/flashcard',
            query: {
                fileName: noteName,
                fileId: noteName,
                generating: 'true'
            }
        });
    } catch (error) {
        console.error("Error preparing flashcards:", error);
        alert("Failed to generate flashcards. Please try again.");
    }
};
</script>

<style scoped>
.notes-page {
  padding: 20px;
}
</style>