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
        <template v-if="isLoading">
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
      <h2 class="section-title">Shared Flashcards</h2>

      <div class="row g-4">
        <!-- Skeleton Loaders -->
        <template v-if="isLoading">
          <div class="col-md-3" v-for="n in 3" :key="'skeleton-' + n">
            <NoteFlashcardSkeleton />
          </div>
        </template>

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
const isLoading = ref(true);

// New refs for file upload
const pdfInput = ref(null);
const selectedFile = ref(null);
const uploadStatus = ref("");
const uploadBtnText = ref("Upload PDF");
const uploading = ref(false);

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

// Existing getNotes function
async function getNotes() {
  try {
    isLoading.value = true;
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
    isLoading.value = false;
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
</style>
