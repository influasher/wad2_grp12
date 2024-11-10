<!-- pages/flashcard.vue -->
<template>
  <div class="container">
    <header>
      <h1>Flashcards: {{ fileName }}</h1>
    </header>

    <main>
      <!-- Loading Screen (Generating) -->
      <div v-if="isGenerating" class="loading-content">
        <h2>Generating Flashcards</h2>
        <p>Get ready to revise!</p>
        <div class="spinner"></div>
      </div>

      <!-- Loading Screen (Retrieving) -->
      <div v-else-if="isRetrieving" class="loading-content">
        <h2>Retrieving Flashcards</h2>
        <p>Get ready to revise!</p>
        <div class="spinner"></div>
      </div>

      <!-- Flashcard Content -->
      <div v-else class="section flashcard-content">
        <div v-if="flashcards.length">
          <div class="flashcard-navigation">
            <button
              @click="showPreviousCard"
              :disabled="currentCardIndex === 0"
              class="desktop-nav"
            >
              Previous
            </button>
            <button
              @click="showPreviousCard"
              :disabled="currentCardIndex === 0"
              class="mobile-nav"
              aria-label="Previous card"
            >
              <span class="arrow arrow-left">↑</span>
            </button>
            <span
              >Card {{ currentCardIndex + 1 }} of {{ flashcards.length }}</span
            >
            <button
              @click="showNextCard"
              :disabled="
                !currentCardAnswered ||
                currentCardIndex === flashcards.length - 1
              "
              class="desktop-nav"
            >
              Next
            </button>
            <button
              @click="showNextCard"
              :disabled="
                !currentCardAnswered ||
                currentCardIndex === flashcards.length - 1
              "
              class="mobile-nav"
              aria-label="Next card"
            >
              <span class="arrow arrow-right">↑</span>
            </button>
          </div>

          <div class="flashcard">
            <div class="question">{{ currentCard.question }}</div>
            <div class="answer-choices">
              <button
                v-for="(answer, index) in answers"
                :key="index"
                :class="['answer-choice', getAnswerClass(index)]"
                @click="handleAnswerChoice(index)"
                :disabled="selectedAnswerIndex !== null"
              >
                {{ answer.text }}
              </button>
            </div>

            <div class="feedback" v-if="feedbackMessage">
              <p v-html="feedbackMessage"></p>
              <button
                v-if="!answers[selectedAnswerIndex].correct"
                @click="retryQuestion"
                class="retry-button"
              >
                Retry Question
              </button>
            </div>
          </div>
        </div>
        <div v-else class="info-message">No flashcards available.</div>
      </div>
    </main>
    <FloatingChat :file-id="fileName" />
    <CompletionPopup
      :show="showCompletionPopup"
      :onGenerateMore="handleGenerateMore"
      :mode="mode"
      @restart="handleRestart"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import FloatingChat from "@/components/FloatingChat.vue";
import CompletionPopup from "@/components/CompletionPopup.vue";
import { createClient } from "@supabase/supabase-js";

const config = useRuntimeConfig();
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseKey
);
const route = useRoute();
const fileName = ref(route.query.name || "Untitled");
const isGenerating = ref(route.query.generating === "true");
const isRetrieving = ref(false);
const mode = ref(route.query.mode || "generate");

const flashcards = ref([]);
const currentCardIndex = ref(0);
const currentCardAnswered = ref(false);
const selectedAnswerIndex = ref(null);
const feedbackMessage = ref("");
const showSource = ref(false);
const answers = ref([]);
const showCompletionPopup = ref(false);

const currentCard = computed(() => flashcards.value[currentCardIndex.value]);

async function retrieveExistingFlashcards() {
  isRetrieving.value = true;
  try {
    const flashcardPath = "flashcards/" + fileName.value;
    console.log(`Retrieving flashcards from: ${flashcardPath}`);

    const { data: fileList, error } = await supabase.storage
      .from("files_wad2")
      .list(flashcardPath);

    if (error) {
      console.error("Error listing flashcard files:", error);
      return;
    }

    if (!fileList || fileList.length === 0) {
      console.log("No flashcards found.");
      flashcards.value = [];
      return;
    }

    const downloadPromises = fileList.map(async (file) => {
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("files_wad2")
          .download(`${flashcardPath}/${file.name}`);

        if (downloadError) {
          console.error(`Error downloading ${file.name}:`, downloadError);
          return [];
        }

        const text = await fileData.text();

        try {
          const parsedData = JSON.parse(text);

          if (!parsedData.flashcards || !Array.isArray(parsedData.flashcards)) {
            console.error(`Invalid flashcard data structure in ${file.name}`);
            return [];
          }

          return parsedData.flashcards;
        } catch (parseError) {
          console.error(`Error parsing JSON from ${file.name}:`, parseError);
          return [];
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        return [];
      }
    });

    const flashcardsArrays = await Promise.all(downloadPromises);
    const combinedFlashcards = flashcardsArrays.flat();

    console.log("Retrieved flashcards:", combinedFlashcards);
    flashcards.value = combinedFlashcards;

    if (combinedFlashcards.length > 0) {
      currentCardIndex.value = 0;
      prepareCurrentCard();
    }
  } catch (error) {
    console.error("Error in retrieveExistingFlashcards:", error);
    flashcards.value = [];
  } finally {
    isRetrieving.value = false;
  }
}

const generateFlashcards = async () => {
  isGenerating.value = true;
  const progressMessage = ref("Starting flashcard generation...");
  let accumulatedContent = "";

  try {
    const response = await fetch(
      "https://elementalbackend.vercel.app/api/supabase/generate-flashcards",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          file_id: fileName.value,
          count: 3,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const eventData = line.slice(6);

          // Skip if it's the done message
          if (eventData === "[DONE]") continue;

          try {
            const data = JSON.parse(eventData);
            console.log("Received data:", data); // For debugging

            // Update progress message
            if (data.message) {
              progressMessage.value = data.message;
            }

            // Handle different status types
            switch (data.status) {
              case "started":
              case "processing":
              case "generating":
              case "formatting":
              case "uploading":
                console.log(data.message);
                break;

              case "completed":
                if (data.flashcards && Array.isArray(data.flashcards)) {
                  flashcards.value = data.flashcards;
                  currentCardIndex.value = 0;
                  prepareCurrentCard();
                  console.log("Flashcards loaded successfully");
                } else {
                  console.error("Invalid flashcard data format:", data);
                  throw new Error("Invalid flashcard data received");
                }
                break;

              case "error":
                console.error("Error from server:", data.message);
                throw new Error(data.message);
                break;
            }
          } catch (e) {
            console.error(
              "Error parsing streaming data:",
              e,
              "Raw data:",
              eventData
            );
            throw new Error("Error processing server response");
          }
        }
      }
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    alert(`Error generating flashcards: ${error.message}`);
  } finally {
    isGenerating.value = false;
  }
};

const handleGenerateMore = async () => {
  showCompletionPopup.value = false;
  isGenerating.value = true;
  try {
    const response = await axios.post(
      "https://elementalbackend.vercel.app/api/supabase/generate-flashcards",
      {
        file_id: fileName.value,
        count: 3,
      }
    );

    if (response.data.flashcards && Array.isArray(response.data.flashcards)) {
      flashcards.value = response.data.flashcards;
      currentCardIndex.value = 0;
      prepareCurrentCard();
    }
  } catch (error) {
    console.error("Error generating more flashcards:", error);
    alert("Error generating more flashcards. Please try again.");
  } finally {
    isGenerating.value = false;
  }
};

const handleRestart = () => {
  showCompletionPopup.value = false;
  currentCardIndex.value = 0;
  currentCardAnswered.value = false;
  selectedAnswerIndex.value = null;
  feedbackMessage.value = "";

  flashcards.value = shuffleArray([...flashcards.value]);

  prepareCurrentCard();
};

const prepareCurrentCard = () => {
  if (flashcards.value.length > 0) {
    const card = currentCard.value;
    answers.value = generateAnswerChoices(card);
    currentCardAnswered.value = false;
    selectedAnswerIndex.value = null;
    feedbackMessage.value = "";
    showSource.value = false;
  }
};

const generateAnswerChoices = (card) => {
  const allAnswers = [
    { text: card.answer, correct: true },
    ...card.wrong_answers.map((wrongAnswer) => ({
      text: typeof wrongAnswer === "string" ? wrongAnswer : wrongAnswer.text,
      correct: false,
    })),
  ];
  return shuffleArray(allAnswers);
};

const handleAnswerChoice = async (index) => {
  if (selectedAnswerIndex.value !== null) return;
  selectedAnswerIndex.value = index;
  showSource.value = true;

  const answer = answers.value[index];
  if (answer.correct) {
    currentCardAnswered.value = true;
    feedbackMessage.value = `
      <p class="correct">Correct! Well done!</p>
      <p class="correct">${currentCard.value.quote || ""}<br/>Page ${
      currentCard.value.page
    }</p>
    `;

    if (currentCardIndex.value === flashcards.value.length - 1) {
      showCompletionPopup.value = true;
    }
  } else {
    try {
      const response = await axios.post(
        "https://elementalbackend.vercel.app/api/explain-answer",
        {
          question: currentCard.value.question,
          correct_answer: answers.value.find((a) => a.correct).text,
          wrong_answer: answer.text,
        }
      );
      feedbackMessage.value = `
        <p class="incorrect">Incorrect.</p>
        <p>${response.data.explanation}</p>
      `;
    } catch (error) {
      console.error("Error getting explanation:", error);
      feedbackMessage.value = `
        <p class="incorrect">Incorrect. Please try again.</p>
      `;
    }
  }
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const getAnswerClass = (index) => {
  if (selectedAnswerIndex.value === null) return "";
  const answer = answers.value[index];

  if (
    selectedAnswerIndex.value !== null &&
    index === selectedAnswerIndex.value
  ) {
    return answers.value[index].correct ? "correct" : "incorrect";
  }

  return "";
};

const retryQuestion = () => {
  selectedAnswerIndex.value = null;
  currentCardAnswered.value = false;
  feedbackMessage.value = "";
  showSource.value = false;
};

const showPreviousCard = () => {
  if (currentCardIndex.value > 0) {
    currentCardIndex.value--;
    prepareCurrentCard();
  }
};

const showNextCard = () => {
  if (
    currentCardIndex.value < flashcards.value.length - 1 &&
    currentCardAnswered.value
  ) {
    currentCardIndex.value++;
    prepareCurrentCard();
  }
};

//if flashcard.vue is loaded for existing flashcards

onMounted(() => {
  console.log("Mounted with mode:", mode.value);
  console.log("File name:", fileName.value);
  if (mode.value === "review") {
    console.log("Initiating flashcard retrieval");
    retrieveExistingFlashcards();
    // } else if (isGenerating.value) {
    //   console.log("Initiating flashcard generation");
    //   generateFlashcards();
    // }
  } else if (mode.value === "generate") {
    console.log("Initiating flashcard generation");
    generateFlashcards();
  }
});
</script>

<style scoped>
* {
  --primary-color: #cecae7;
  --secondary-color: #b2a9ec;
  --button-color: #7662f2;
  --button-hover: #593fff;
  --text-color: #333;
  --border-radius: 12px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  line-height: 1.6;
  color: var(--text-color);
  background-color: #f0f2f5;
}

/* Header styles */
.container header {
  text-align: center;
}

.container h1 {
  color: var(--button-color);
  margin-bottom: 30px;
}

/* Section styles */
.section {
  background: white;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Loading screen styles */
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-content h2 {
  color: var(--button-color);
  margin-bottom: 0.5rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Navigation and action button styles */
button {
  background-color: var(--button-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: var(--button-hover);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Flashcard styles */
.flashcard {
  padding: 20px;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

/* Navigation styles */
.flashcard-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* Answer choices styles */
.answer-choices {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.answer-choice {
  text-align: left;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #333;
  transition: all 0.3s ease;
  cursor: pointer;
}

.answer-choice:hover:not(:disabled) {
  background: var(--primary-color);
}

.answer-choice.correct {
  background-color: #4caf50;
  color: white;
}

.answer-choice.correct:hover {
  background-color: #4caf50;
}

.answer-choice.incorrect {
  background-color: #f44336;
  color: white;
}

.answer-choice.incorrect:hover {
  background-color: #f44336;
}

/* Feedback styles */
.feedback {
  margin-top: 20px;
  padding: 15px;
  border-radius: var(--border-radius);
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.feedback p {
  margin: 0;
}

/* Message styles */
.error-message {
  color: #f44336;
  background-color: #ffebee;
}

.info-message {
  background-color: #e7f3fe;
  color: #31708f;
}

.error-message,
.info-message {
  padding: 15px;
  border-radius: var(--border-radius);
  margin: 10px 0;
  text-align: center;
}

/* Navigation button styles */
.mobile-nav {
  padding: 8px;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow {
  font-size: 24px;
  line-height: 1;
  display: inline-block;
  color: white;
}

.arrow-left {
  transform: rotate(-90deg);
}

.arrow-right {
  transform: rotate(90deg);
}

/* Responsive styles */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-nav {
    display: flex;
  }

  .flashcard-navigation {
    padding: 0 10px;
    gap: 12px;
  }

  .flashcard-navigation span {
    font-size: 14px;
  }
}

@media (min-width: 769px) {
  .desktop-nav {
    display: inline-block;
  }

  .mobile-nav {
    display: none;
  }
}
</style>
