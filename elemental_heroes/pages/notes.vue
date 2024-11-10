<template>
  <div class="notes-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>{{ noteName }}</h1>
      <div class="d-flex gap-2">
        <NuxtLink :to="{ path: '/flashcard', query: { name: noteName } }">
          <button class="btn btn-primary">Generate Flashcards</button>
        </NuxtLink>
        <button
          class="delete-btn"
          @click.prevent="handleDelete"
          title="Delete folder"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
    <div class="d-flex justify-content-center mb-4">
      <iframe
        v-if="noteUrl"
        class="pdf-viewer"
        scrolling="no"
        seamless="seamless"
        :src="noteUrl"
      ></iframe>
    </div>
    <FloatingChat :fileId="noteName" />
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h4>Confirm Deletion</h4>
        <p>Are you sure you want to delete "{{ noteName }}"?</p>
        <div class="modal-buttons">
          <button @click="proceedWithDelete" class="btn btn-danger">Delete</button>
          <button @click="closeModal" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="modal-content">
        <h4>Success</h4>
        <p>{{ modalMessage }}</p>
        <button @click="closeModal" class="btn btn-primary">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { createClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from "#app";
import FloatingChat from "@/components/FloatingChat.vue";

const config = useRuntimeConfig();
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseKey
);
const route = useRoute();
const router = useRouter();
const noteName = route.query.name;
const noteUrl = ref(null);
const showDeleteModal = ref(false);
const showSuccessModal = ref(false);
const modalMessage = ref("");


async function getPDF() {
  const { data, error } = await supabase.storage
    .from("files_wad2")
    .getPublicUrl(`user_pdfs/${noteName}.pdf`);
  if (data) {
    noteUrl.value = data.publicUrl;
    console.log(noteUrl.value);
  }
}

function handleDelete() {
  showDeleteModal.value = true; // Opens the delete confirmation modal
}

async function proceedWithDelete() {
  try {
    // Delete the PDF file
    const { error: deletePDFError } = await supabase.storage
      .from("files_wad2")
      .remove([`user_pdfs/${noteName}.pdf`]);

    // Delete PDF preview file
    const { error: deletePreviewError } = await supabase.storage
      .from("files_wad2")
      .remove([`previews/${noteName}.png`]);

    if (deletePDFError || deletePreviewError) throw deletePDFError || deletePreviewError;

    // Show success modal with custom message
    modalMessage.value = `"${noteName}" deleted successfully.`;
    showSuccessModal.value = true;
  } catch (error) {
    console.error("Error deleting note:", error);
    modalMessage.value = "Failed to delete note. Please try again.";
    showSuccessModal.value = true;
  } finally {
    showDeleteModal.value = false; // Close delete confirmation modal
  }
}

function closeModal() {
  if (showSuccessModal.value) {
    showSuccessModal.value = false;
    router.push("/revision"); // Redirects to revision page
  } else {
    showDeleteModal.value = false;
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

.delete-btn {
  border: none;
  background: transparent;
  padding: 0.5rem;
  cursor: pointer;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.delete-btn svg {
  width: 20px;
  height: 20px;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  color: #ff4444;
}

.delete-btn:hover svg {
  transform: scale(1.2);
}

.pdf-viewer {
  width: 80%;
  height: 100vh; /* Sets height to 70% of the viewport height */
  border: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 300px;
  text-align: center;
}

.modal-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

@media (max-width: 768px) {
  .pdf-viewer {
    width: 100%;
    height: 100vh;
  }
}
</style>
