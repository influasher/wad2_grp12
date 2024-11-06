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
          <!-- Modified upload card to handle file selection -->
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

        <!-- Skeleton Loaders -->
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
              <div class="card-body">
                <h5 class="card-title">{{ note.name }}</h5>
                <p class="card-text text-muted">
                  Uploaded: {{ note.formattedDate }}
                </p>
              </div>
            </NuxtLink>

            <!-- Add delete button -->
            <button
              class="delete-btn"
              @click.prevent="handleNoteDelete(note.name)"
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

    <!-- My Flashcards Section -->
    <div class="mb-5">
      <h2 class="section-title">My Flashcards</h2>

      <div class="row g-4">
        <!-- Skeleton Loaders -->
        <template v-if="isLoadingFlashcards">
          <div class="col-md-3" v-for="n in 3" :key="'skeleton-' + n">
            <NoteFlashcardSkeleton />
          </div>
        </template>

        <!-- Show actual content when loaded -->
        <div v-else class="row g-4">
          <div
            class="col-md-3"
            v-for="folder in flashcardFolders"
            :key="folder.name"
          >
            <div
              class="card custom-card flashcard position-relative card-container"
            >
              <!-- Card content wrapped in NuxtLink -->
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

              <!-- Delete button -->
              <button
                class="delete-btn"
                @click.prevent="handleFlashcardDelete(folder.name)"
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

const handleFlashcardDelete = async (folderName) => {
  const confirmed = confirm(
    `Are you sure you want to delete "${folderName}" and all its flashcards?`
  );
  if (!confirmed) return;

  try {
    isDeleting.value = true;

    // First, list all files in the folder
    const { data: files, error: listError } = await supabase.storage
      .from("files_wad2")
      .list(`flashcards/${folderName}`);

    if (listError) throw listError;

    // Delete all files in the folder
    for (const file of files) {
      const { error: deleteError } = await supabase.storage
        .from("files_wad2")
        .remove([`flashcards/${folderName}/${file.name}`]);

      if (deleteError) throw deleteError;
    }

    // Delete the empty folder (if your storage supports it)
    const { error: folderError } = await supabase.storage
      .from("files_wad2")
      .remove([`flashcards/${folderName}/.emptyFolderPlaceholder`]);

    if (folderError && !folderError.message.includes("Object not found")) {
      throw folderError;
    }

    // Refresh the flashcards list
    await getFlashcards();
    alert("Flashcards deleted successfully");
  } catch (error) {
    console.error("Error deleting folder:", error);
    alert("Error deleting folder. Please try again.");
  } finally {
    isDeleting.value = false;
  }
};

const handleNoteDelete = async (noteName) => {
  const confirmed = confirm(`Are you sure you want to delete "${noteName}"?`);
  if (!confirmed) return;

  try {
    isDeleting.value = true;

    // Delete the PDF file
    const { error: deleteError } = await supabase.storage
      .from("files_wad2")
      .remove([`user_pdfs/${noteName}.pdf`]);

    if (deleteError) throw deleteError;

    // Refresh the notes list
    await getNotes();
    alert("Note deleted successfully");
  } catch (error) {
    console.error("Error deleting note:", error);
    alert("Error deleting note. Please try again.");
  } finally {
    isDeleting.value = false;
  }
};

// Function to trigger file input
const triggerFileInput = () => {
  if (!selectedFile.value) {
    pdfInput.value.click();
  }
};

// Function to handle file selection
const handleFileSelected = (event) => {
  const file = event.target.files[0];
  if (file && file.type === "application/pdf") {
    selectedFile.value = file;
  } else {
    alert("Please select a PDF file.");
    event.target.value = null;
  }
};

// Upload PDF function from flashcard.vue
const uploadPdf = async (event) => {
  event.stopPropagation(); // Prevent card click event

  if (!selectedFile.value) {
    alert("Please select a PDF file first.");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile.value);

  try {
    uploading.value = true;
    uploadBtnText.value = "Uploading...";
    uploadStatus.value = "Uploading PDF...";

    const response = await axios.post(
      "http://127.0.0.1:5000/api/supabase/upload-pdf",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    uploadStatus.value = ``;
    alert(`PDF uploaded successfully! ${response.data.num_pages} pages found.`);

    // Reset file selection and refresh notes list
    // setTimeout(() => {
    //   selectedFile.value = null;
    //   uploadStatus.value = "";
    //   getNotes();
    // }, 1000);
    selectedFile.value = null;
    uploadStatus.value = "";
    getNotes();
  } catch (error) {
    console.error("Error uploading PDF:", error);
    uploadStatus.value = "Error uploading PDF. Please try again.";
  } finally {
    uploading.value = false;
    uploadBtnText.value = "Upload PDF";
  }
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
    isLoadingNotes.value = false;
  }
}

async function getFlashcards() {
  try {
    isLoadingFlashcards.value = true;

    // First, list all folders in the flashcards directory
    const { data: folders, error: foldersError } = await supabase.storage
      .from("files_wad2")
      .list("flashcards");

    if (foldersError) {
      throw foldersError;
    }

    // Process each folder
    const folderPromises = folders.map(async (folder) => {
      if (folder.name === ".emptyFolderPlaceholder") return null;

      // List files in each folder
      const { data: files, error: filesError } = await supabase.storage
        .from("files_wad2")
        .list(`flashcards/${folder.name}`);

      if (filesError) {
        console.error(`Error listing files in ${folder.name}:`, filesError);
        return null;
      }

      // Calculate total flashcards (5 cards per file)
      const fileCount = files.filter(
        (file) => !file.name.startsWith(".")
      ).length;
      const totalCards = fileCount * 5;

      return {
        name: folder.name,
        totalCards: totalCards,
        fileCount: fileCount,
      };
    });

    // Wait for all folder processing to complete
    const processedFolders = await Promise.all(folderPromises);

    // Filter out null values and update the ref
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

.custom-card {
  background-color: #ffffff; /* White background for contrast */
  height: 150px;
  border: 0.5px solid #e4e3e3; /* Light border */
  border-radius: 8px; /* Rounded corners */
  /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);  */
  /* Subtle shadow for depth */
  transition: transform 0.2s, box-shadow 0.2s; /* Smooth transition for hover effect */
  overflow: auto;
}

.custom-card::-webkit-scrollbar {
  display: none;
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

/* Updated card container style */
.card-container {
  position: relative;
  overflow: visible; /* Allow delete button to be visible outside card boundaries if needed */
}

/* Updated delete button styles */
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

/* Show delete button on card hover */
.card-container:hover .delete-btn {
  opacity: 1;
  pointer-events: auto;
}

.delete-btn:hover {
  color: #dc3545;
  transform: scale(1.1);
}

/* Adjust card-body padding to prevent text overlap with delete button */
.card-body {
  padding-bottom: 2.5rem; /* Add extra padding at bottom to accommodate delete button */
}

/* Note card specific styles */
/* .note-card {
  border: 1px solid #e5e7eb;
  background: linear-gradient(to bottom right, #ffffff, #fafafa);
} */
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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' /%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

/* Flashcard specific styles */
/* .flashcard {
  border: 1px solid var(--unity-purple);
  background: linear-gradient(135deg, var(--unity-gray) 0%, #ffffff 100%);
} */

/* .flashcard:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(139, 110, 243, 0.15);
  border-color: var(--unity-purple);
} */

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

/* On hover state for better interaction */
/* .flashcard:hover .card-title {
  color: var(--unity-hover);
} */

/* Additional styles for better contrast */
/* .flashcard:hover .card-text {
  color: var(--unity-dark);
} */
</style>
