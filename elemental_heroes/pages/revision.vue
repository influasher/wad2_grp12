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
          <NuxtLink
            :to="{ path: '/notes', query: { name: note.name } }"
            style="text-decoration: none"
          >
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
            <div class="card custom-card position-relative card-container">
              <!-- Card content wrapped in NuxtLink -->
              <!-- <NuxtLink
                :to="{ path: '/flashcards', query: { folder: folder.name } }"
                style="text-decoration: none; color: inherit"
              > -->
              <div class="card-body">
                <h5 class="card-title">{{ folder.name }}</h5>
                <p class="card-text text-muted">
                  {{ folder.totalCards }} cards
                </p>
              </div>
              <!-- </NuxtLink> -->

              <!-- Delete button -->
              <button
                class="delete-btn"
                @click.prevent="confirmDelete(folder.name)"
                title="Delete folder"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Confirm Delete</h3>
          <p>
            Are you sure you want to delete "{{ folderToDelete }}" and all its
            flashcards?
          </p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showDeleteModal = false">
              Cancel
            </button>
            <button
              class="btn btn-danger"
              @click="deleteFolder"
              :disabled="isDeleting"
            >
              {{ isDeleting ? "Deleting..." : "Delete" }}
            </button>
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

// Existing refs
const notes = ref([]);
const isLoadingNotes = ref(true);
const isLoadingFlashcards = ref(true);

// New refs for file upload
const pdfInput = ref(null);
const selectedFile = ref(null);
const uploadStatus = ref("");
const uploadBtnText = ref("Upload PDF");
const uploading = ref(false);

// Add new ref for flashcard folders
const flashcardFolders = ref([]);

// Add new refs for delete functionality
const showDeleteModal = ref(false);
const folderToDelete = ref("");
const isDeleting = ref(false);

// Function to show delete confirmation modal
const confirmDelete = (folderName) => {
  folderToDelete.value = folderName;
  showDeleteModal.value = true;
};

// Function to delete folder and its contents
const deleteFolder = async () => {
  try {
    isDeleting.value = true;

    // First, list all files in the folder
    const { data: files, error: listError } = await supabase.storage
      .from("files_wad2")
      .list(`flashcards/${folderToDelete.value}`);

    if (listError) throw listError;

    // Delete all files in the folder
    for (const file of files) {
      const { error: deleteError } = await supabase.storage
        .from("files_wad2")
        .remove([`flashcards/${folderToDelete.value}/${file.name}`]);

      if (deleteError) throw deleteError;
    }

    // Delete the empty folder (if your storage supports it)
    const { error: folderError } = await supabase.storage
      .from("files_wad2")
      .remove([`flashcards/${folderToDelete.value}/.emptyFolderPlaceholder`]);

    if (folderError && !folderError.message.includes("Object not found")) {
      throw folderError;
    }

    // Refresh the flashcards list
    await getFlashcards();

    // Close the modal and show success message
    showDeleteModal.value = false;
    alert("Folder deleted successfully");
  } catch (error) {
    console.error("Error deleting folder:", error);
    alert("Error deleting folder. Please try again.");
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

    uploadStatus.value = `PDF uploaded successfully! ${response.data.num_pages} pages found.`;

    // Reset file selection and refresh notes list
    setTimeout(() => {
      selectedFile.value = null;
      uploadStatus.value = "";
      getNotes();
    }, 2000);
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

/* Modified delete button styles for bottom right positioning */
.delete-btn {
  position: absolute;
  bottom: 8px;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  z-index: 2;
  padding: 0 5px;
  line-height: 1;
  transition: all 0.2s ease;
  opacity: 0;
  pointer-events: none;
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

/* Modal styles remain the same */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
