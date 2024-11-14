<!-- pages/revision.vue -->
<template>
  <div class="home-page">
    <!-- Top Section -->
    <div class="mb-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="section-title">My Notes</h2>
      </div>

      <div class="row g-4">
        <div class="col-md-3">
          <div class="card custom-card upload-card" @click="triggerFileInput">
            <input
              type="file"
              ref="pdfInput"
              accept=".pdf"
              style="display: none"
              @change="handleFileSelected"
            />
            <div class="card-body text-center" v-if="!selectedFile">
              <h5 class="card-title">+</h5>
              <p class="card-text text-muted">Upload Notes</p>
            </div>
            <div class="card-body text-center" v-else>
              <p class="card-text">{{ selectedFile.name }}</p>
              <button
                class="btn btn-primary mt-2"
                @click.stop="uploadPdf"
                :disabled="uploading"
              >
                {{ uploadBtnText }}
              </button>
              <p class="text-muted mt-2" v-if="uploadStatus">
                {{ uploadStatus }}
              </p>
            </div>
          </div>
        </div>

        <template v-if="isLoadingNotes">
          <div class="col-md-3" v-for="n in 3" :key="'skeleton-' + n">
            <NoteFlashcardSkeleton />
          </div>
        </template>

        <div class="col-md-3" v-for="note in notes" :key="note">
          <div
            class="card custom-card note-card position-relative card-container"
          >
            <NuxtLink
              :to="{ path: '/notes', query: { name: note.name } }"
              style="text-decoration: none"
            >
              <div class="preview-container">
                <img
                  :src="note.previewUrl || '/placeholder-pdf.png'"
                  :alt="note.name"
                  class="pdf-preview"
                  @error="handlePreviewError"
                />
                <div class="preview-overlay">
                  <h5 class="card-title">{{ note.name }}</h5>
                  <p class="card-text">Uploaded: {{ note.formattedDate }}</p>
                </div>
              </div>
            </NuxtLink>

            <button
              class="delete-btn"
              @click.prevent="confirmDelete(note.name)"
              title="Delete note"
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
      </div>
    </div>

    <div class="mb-5">
      <h2 class="section-title">My Flashcards</h2>

      <div class="row g-4">
        <template v-if="isLoadingFlashcards">
          <div class="col-md-3" v-for="n in 3" :key="'skeleton-' + n">
            <NoteFlashcardSkeleton />
          </div>
        </template>

        <div
          class="col-md-3"
          v-for="folder in flashcardFolders"
          :key="folder.name"
        >
          <div
            class="card custom-card flashcard position-relative card-container"
          >
            <NuxtLink
              :to="{
                path: '/flashcard',
                query: { name: folder.name, mode: 'review' },
              }"
              style="text-decoration: none; color: inherit"
            >
              <div class="card-body">
                <h5 class="card-title">{{ folder.name }}</h5>
                <p class="card-text text-muted">
                  {{ folder.totalCards }} cards
                </p>
              </div>
            </NuxtLink>

            <button
              class="delete-btn"
              @click.prevent="confirmFlashcardDelete(folder.name)"
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
      </div>
    </div>
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h4>{{ modalTitle }}</h4>
        <p>{{ modalMessage }}</p>
        <button @click="closeModal" class="btn btn-primary">OK</button>
      </div>
    </div>
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h4>Confirm Deletion</h4>
        <p>Are you sure you want to delete "{{ itemToDelete }}"?</p>
        <div class="modal-buttons">
          <button @click="proceedWithDelete" class="btn btn-danger">
            Delete
          </button>
          <button @click="closeDeleteModal" class="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
    <div v-if="showDeleteFlashcardModal" class="modal-overlay">
      <div class="modal-content">
        <h4>Confirm Deletion</h4>
        <p>
          Are you sure you want to delete "{{ flashcardToDelete }}" and all its
          flashcards?
        </p>
        <div class="modal-buttons">
          <button @click="proceedWithFlashcardDelete" class="btn btn-danger">
            Delete
          </button>
          <button @click="closeFlashcardModal" class="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div v-if="showFlashcardSuccessModal" class="modal-overlay">
      <div class="modal-content">
        <h4>Success</h4>
        <p>{{ flashcardModalMessage }}</p>
        <button @click="closeFlashcardModal" class="btn btn-primary">OK</button>
      </div>
    </div>
    <div v-if="showDeletionProgressModal" class="modal-overlay">
      <div class="modal-content">
        <h4>Deleting {{ flashcardToDelete }}</h4>
        <div class="progress-bar">
          <div
            class="progress"
            :style="{ width: deletionProgress + '%' }"
          ></div>
        </div>
        <p>{{ deletionProgressMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { createClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from "#app";

import { ref, onMounted } from "vue";
import axios from "axios";
import NoteFlashcardSkeleton from "~/components/NoteFlashcardSkeleton.vue";

const config = useRuntimeConfig();
const router = useRouter();
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseKey
);
const notes = ref([]);
const isLoadingNotes = ref(true);
const isLoadingFlashcards = ref(true);
const pdfInput = ref(null);
const selectedFile = ref(null);
const uploadStatus = ref("");
const uploadBtnText = ref("Upload PDF");
const uploading = ref(false);
const flashcardFolders = ref([]);
const isDeleting = ref(false);
const showModal = ref(false);
const modalTitle = ref("");
const modalMessage = ref("");
const showDeleteModal = ref(false);
const itemToDelete = ref("");
const showDeleteFlashcardModal = ref(false);
const showFlashcardSuccessModal = ref(false);
const flashcardToDelete = ref("");
const flashcardModalMessage = ref("");
const showDeletionProgressModal = ref(false);
const deletionProgress = ref(0);
const deletionProgressMessage = ref("");

const confirmFlashcardDelete = (folderName) => {
  flashcardToDelete.value = folderName;
  showDeleteFlashcardModal.value = true;
};

const proceedWithFlashcardDelete = async () => {
  try {
    isDeleting.value = true;

    showDeleteFlashcardModal.value = false;

    showDeletionProgressModal.value = true;
    deletionProgress.value = 0;
    deletionProgressMessage.value = "Deleting...";

    const { data: files, error: listError } = await supabase.storage
      .from("files_wad2")
      .list(`flashcards/${flashcardToDelete.value}`);

    if (listError) throw listError;

    const totalFiles = files.length;
    let filesDeleted = 0;

    for (const file of files) {
      const { error: deleteError } = await supabase.storage
        .from("files_wad2")
        .remove([`flashcards/${flashcardToDelete.value}/${file.name}`]);

      if (deleteError) throw deleteError;

      filesDeleted++;
      deletionProgress.value = Math.round((filesDeleted / totalFiles) * 100);

      deletionProgressMessage.value = "Deleting...";

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    await supabase.storage
      .from("files_wad2")
      .remove([
        `flashcards/${flashcardToDelete.value}/.emptyFolderPlaceholder`,
      ]);

    await getFlashcards();
    flashcardModalMessage.value = `"${flashcardToDelete.value}" deleted successfully.`;
    showFlashcardSuccessModal.value = true;
  } catch (error) {
    console.error("Error deleting flashcard folder:", error);
    flashcardModalMessage.value =
      "Error deleting flashcard folder. Please try again.";
    showFlashcardSuccessModal.value = true;
  } finally {
    isDeleting.value = false;
    showDeletionProgressModal.value = false;
    deletionProgress.value = 0;
  }
};

const closeFlashcardModal = () => {
  showDeleteFlashcardModal.value = false;
  showFlashcardSuccessModal.value = false;
  flashcardModalMessage.value = "";
};

const confirmDelete = (noteName) => {
  itemToDelete.value = noteName;
  showDeleteModal.value = true;
};

const proceedWithDelete = () => {
  handleNoteDelete();
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

const handleNoteDelete = async () => {
  try {
    isDeleting.value = true;

    const { error: deletePDFError } = await supabase.storage
      .from("files_wad2")
      .remove([`user_pdfs/${itemToDelete.value}.pdf`]);

    const { error: deletePreviewError } = await supabase.storage
      .from("files_wad2")
      .remove([`previews/${itemToDelete.value}.png`]);

    if (deletePDFError || deletePreviewError)
      throw deletePDFError || deletePreviewError;

    await getNotes();

    modalTitle.value = "PDF Deletion Successful";
    modalMessage.value = `"${itemToDelete.value}" deleted successfully.`;
    showModal.value = true;
  } catch (error) {
    console.error("Error deleting note:", error);
    modalMessage.value = "Error deleting note. Please try again.";
    showModal.value = true;
  } finally {
    isDeleting.value = false;
    closeDeleteModal();
  }
};

const triggerFileInput = () => {
  if (!selectedFile.value) {
    pdfInput.value.click();
  }
};

const handleFileSelected = (event) => {
  const file = event.target.files[0];
  if (file && file.type === "application/pdf") {
    selectedFile.value = file;
  } else {
    alert("Please select a PDF file.");
    event.target.value = null;
  }
};

const uploadPdf = async (event) => {
  event.stopPropagation();

  if (!selectedFile.value) {
    modalMessage.value = "Please select a PDF file first.";
    showModal.value = true;
    return;
  }

  try {
    const fileNameWithoutExtension = selectedFile.value.name.replace(
      /\.[^/.]+$/,
      ""
    );

    const { data: existingFiles, error: listError } = await supabase.storage
      .from("files_wad2")
      .list("user_pdfs");

    if (listError) throw listError;

    const isDuplicate = existingFiles.some(
      (file) => file.name.replace(/\.[^/.]+$/, "") === fileNameWithoutExtension
    );

    if (isDuplicate) {
      modalTitle.value = "Duplicate File Error";
      modalMessage.value =
        "This file already exists. Duplicate files cannot be uploaded.";
      showModal.value = true;
      selectedFile.value = null;
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile.value);

    uploading.value = true;
    uploadBtnText.value = "Uploading...";
    uploadStatus.value = "Uploading PDF...";

    const response = await axios.post(
      "https://elementalbackend.vercel.app/api/supabase/upload-pdf",
      formData
    );

    uploadStatus.value = "";
    modalTitle.value = "PDF Upload Successful";
    modalMessage.value = `${response.data.num_pages} pages found.`;
    showModal.value = true;

    selectedFile.value = null;
    getNotes();
  } catch (error) {
    console.error("Error uploading PDF:", error);
    modalTitle.value = "";
    uploadStatus.value = "";
    modalMessage.value = "Error uploading PDF. Please try again.";
    showModal.value = true;
    selectedFile.value = null;
  } finally {
    uploading.value = false;
    uploadBtnText.value = "Upload PDF";
  }
};

const closeModal = () => {
  showModal.value = false;
};

async function getNotes() {
  try {
    isLoadingNotes.value = true;
    const { data, error } = await supabase.storage
      .from("files_wad2")
      .list("user_pdfs");

    if (error) {
      console.log("Error fetching notes:", error);
    } else if (data) {
      notes.value = await Promise.all(
        data.map(async (item) => {
          const nameWithoutExtension = item.name.replace(/\.[^/.]+$/, "");
          const formattedDate = new Date(item.created_at).toLocaleDateString(
            undefined,
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          );

          const { data: previewUrl } = supabase.storage
            .from("files_wad2")
            .getPublicUrl(`previews/${nameWithoutExtension}.png`);

          return {
            ...item,
            name: nameWithoutExtension,
            formattedDate,
            previewUrl: previewUrl?.publicUrl,
          };
        })
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    isLoadingNotes.value = false;
  }
}

async function getFlashcards() {
  try {
    isLoadingFlashcards.value = true;

    const { data: folders, error: foldersError } = await supabase.storage
      .from("files_wad2")
      .list("flashcards");

    if (foldersError) {
      throw foldersError;
    }

    const folderPromises = folders.map(async (folder) => {
      if (folder.name === ".emptyFolderPlaceholder") return null;

      const { data: files, error: filesError } = await supabase.storage
        .from("files_wad2")
        .list(`flashcards/${folder.name}`);

      if (filesError) {
        console.error(`Error listing files in ${folder.name}:`, filesError);
        return null;
      }

      let totalCards = 0;
      for (const file of files) {
        if (file.name.startsWith(".")) continue;

        const { data: fileData, error: downloadError } = await supabase.storage
          .from("files_wad2")
          .download(`flashcards/${folder.name}/${file.name}`);

        if (downloadError) {
          console.error(`Error downloading ${file.name}:`, downloadError);
          continue;
        }

        try {
          const text = await fileData.text();
          const parsedData = JSON.parse(text);
          if (parsedData.flashcards && Array.isArray(parsedData.flashcards)) {
            totalCards += parsedData.flashcards.length;
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          continue;
        }
      }

      return {
        name: folder.name,
        totalCards: totalCards,
        fileCount: files.filter((file) => !file.name.startsWith(".")).length,
      };
    });

    const processedFolders = await Promise.all(folderPromises);

    flashcardFolders.value = processedFolders.filter(
      (folder) => folder !== null
    );
  } catch (error) {
    console.error("Error fetching flashcard folders:", error);
  } finally {
    isLoadingFlashcards.value = false;
  }
}

onMounted(() => {
  getNotes();
  getFlashcards();
});
</script>

<style scoped>
.home-page {
  padding: 20px;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.custom-card {
  background-color: #ffffff;
  border: 0.5px solid #e4e3e3;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 280px;
  width: 100%;
  height: 100%;
}

.upload-card {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.upload-card .card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

button:disabled {
  background-color: #9989fb;
}

.card-body {
  padding: 1.25rem;
}

.card-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.card-text {
  color: #666;
  margin-bottom: 0.5rem;
}

.custom-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card-container {
  position: relative;
  height: 100%;
}

.delete-btn {
  position: absolute;
  bottom: 8px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 2;
  padding: 5px;
  transition: all 0.2s ease;
  opacity: 0;
  pointer-events: none;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-container:hover .delete-btn {
  opacity: 1;
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 8px;
}

.delete-btn:hover {
  color: #dc3545;
  transform: scale(1.1);
}

.note-card .card-title {
  color: #374151;
  font-weight: 600;
  position: relative;
  padding-left: 24px;
}

.note-card .card-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFFFFF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' /%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

.flashcard:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 32px rgba(139, 110, 243, 0.25);
}

.flashcard .card-title {
  color: var(--unity-text);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.flashcard .card-text {
  color: var(--unity-text);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.flashcard .card-text::before {
  content: "";
  display: inline-block;
  width: 12px;
  height: 12px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238B6EF3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' /%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 75%;
  overflow: hidden;
  border-radius: 8px;
}

.pdf-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 30%, transparent);
  padding: 20px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.preview-overlay .card-title {
  color: white;
  margin-bottom: 5px;
  font-weight: 600;
}

.preview-overlay .card-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.note-card:hover .pdf-preview {
  transform: scale(1.05);
}

.note-card .preview-overlay .card-title,
.note-card .preview-overlay .card-text {
  color: white;
}

.section-title {
  margin-bottom: 1rem;
  color: #374151;
  font-weight: 600;
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

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  margin: 10px 0;
}

.progress {
  height: 100%;
  background-color: #8b6ef3;
  width: 0;
  transition: width 0.2s ease;
}

@media (max-width: 768px) {
  .home-page {
    padding: 10px;
  }

  .row {
    gap: 1rem;
  }
}
</style>
