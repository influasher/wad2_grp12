<template>
  <div class="container">
    <header>
      <h1>Flashcards: {{ fileName }}</h1>
    </header>

    <main>
      <!-- Loading Screen -->
      <div v-if="isGenerating" class="loading-content">
          <h2>Generating Flashcards</h2>
          <p>Get ready to revise!</p>
          <div class="spinner"></div>
      </div>

      <!-- Flashcard Content -->
      <div v-else class="section flashcard-content">
        <div v-if="flashcards.length">
          <div class="flashcard-navigation">
            <button @click="showPreviousCard" :disabled="currentCardIndex === 0">
              Previous
            </button>
            <span>Card {{ currentCardIndex + 1 }} of {{ flashcards.length }}</span>
            <button @click="showNextCard" :disabled="!currentCardAnswered || currentCardIndex === flashcards.length - 1">
              Next
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
              <button v-if="!answers[selectedAnswerIndex].correct" @click="retryQuestion" class="retry-button">
                Retry Question
              </button>
            </div>
          </div>
        </div>
        <div v-else class="info-message">No flashcards available.</div>
      </div>
    </main>
    <FloatingChat :file-id="fileName"/>
    <CompletionPopup 
      :show="showCompletionPopup"
      :onGenerateMore="handleGenerateMore"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import FloatingChat from '@/components/FloatingChat.vue';
import CompletionPopup from '@/components/CompletionPopup.vue';

const route = useRoute();
const fileName = ref(route.query.name || "Untitled");
const fileId = ref(route.query.fileId || "");
const isGenerating = ref(route.query.generating === "true");

const flashcards = ref([]);
const currentCardIndex = ref(0);
const currentCardAnswered = ref(false);
const selectedAnswerIndex = ref(null);
const feedbackMessage = ref("");
const showSource = ref(false);
const answers = ref([]);
const showCompletionPopup = ref(false);

const currentCard = computed(() => flashcards.value[currentCardIndex.value]);

const generateFlashcards = async () => {
  isGenerating.value = true;
  try {
    const response = await axios.post(
      "http://127.0.0.1:5000/api/supabase/generate-flashcards",
      {
        file_id: fileName.value,
      }
    );

    if (response.data.flashcards && Array.isArray(response.data.flashcards)) {
      flashcards.value = response.data.flashcards;
      currentCardIndex.value = 0;
      prepareCurrentCard();
    } else {
      throw new Error("Invalid flashcard data format");
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    alert("Error generating flashcards. Please try again.");
  } finally {
    isGenerating.value = false;
  }
};

const handleGenerateMore = async () => {
  showCompletionPopup.value = false;
  isGenerating.value = true;
  try {
    const response = await axios.post(
      "http://127.0.0.1:5000/api/supabase/generate-flashcards",
      {
        file_id: fileName.value,
        count: 5
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
      <p class="correct">${currentCard.value.quote || ""}<br/>Page ${currentCard.value.page}</p>
    `;

    if (currentCardIndex.value === flashcards.value.length - 1) {
      showCompletionPopup.value = true;
    }
  } else {
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/explain-answer", {
        question: currentCard.value.question,
        correct_answer: answers.value.find((a) => a.correct).text,
        wrong_answer: answer.text,
      });
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
  if (currentCardIndex.value < flashcards.value.length - 1 && currentCardAnswered.value) {
    currentCardIndex.value++;
    prepareCurrentCard();
  }
};

onMounted(() => {
  // if (fileId.value && isGenerating.value) {
  //   generateFlashcards();
  // }
  generateFlashcards();
});
</script>

<style scoped>
* {
    --primary-color: #CECAE7;
    --secondary-color: #B2A9EC;
    --button-color: #7662F2;
    --button-hover: #593FFF;
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

.container header {
  text-align: center;
}

.container h1 {
  color: var(--button-color);
  margin-bottom: 30px;
}

.container .section {
  background: white;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

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

.container button {
  background-color: var(--button-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.3s;
}

.container button:hover {
  background-color: var(--button-hover);
}

.container .flashcard {
  background: white;
  padding: 20px;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.container .flashcard-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.container .answer-choices {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  color: #333;
}

.container .answer-choice {
  text-align: left;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-color);
}

.container .answer-choice:hover {
  background: var(--primary-color);
}

.container .answer-choice.correct {
  background-color: #4caf50;
  color: white;
}

.container .answer-choice.correct:hover {
  background-color: #4caf50;
  color: white;
}

.container .answer-choice.incorrect {
  background-color: #f44336;
  color: white;
}

.container .answer-choice.incorrect:hover {
  background-color: #f44336;
  color: white;
}

.container .feedback {
  margin-top: 20px;
  padding: 15px;
  border-radius: var(--border-radius);
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.container .feedback p {
  margin: 0;
}

.container .retry-button {
  padding: 8px 16px;
  background-color: var(--button-color);
  color: white;
  border-radius: var(--border-radius);
  cursor: pointer;
  margin-top: 10px;
}

.container .retry-button:hover {
  background-color: var(--button-hover);
}

.container .source {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: var(--border-radius);
}

.container button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.container .error-message {
  color: #f44336;
  padding: 15px;
  background-color: #ffebee;
  border-radius: 4px;
  margin: 10px 0;
  text-align: center;
}

.container .info-message {
  padding: 15px;
  background-color: #e7f3fe;
  border-radius: var(--border-radius);
  margin: 10px 0;
  text-align: center;
  color: #31708f;
}
</style>
