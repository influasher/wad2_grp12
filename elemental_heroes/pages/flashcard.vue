<template>
  <div class="container">
    <header>
      <h1>Elemental Heroes Flashcard Generator & Study Assistant</h1>
    </header>

    <main>
      <div class="section flashcard-generator">
        <h2>Generate Flashcards from PDF</h2>
        <div class="upload-section">
          <input type="file" ref="pdfInput" accept=".pdf" />
          <button @click="uploadPdf" :disabled="uploading">
            {{ uploadBtnText }}
          </button>
        </div>
        <div>{{ uploadStatus }}</div>
        <button
          @click="generateFlashcards"
          :disabled="!currentFileId || generating"
        >
          {{ generateBtnText }}
        </button>
        <div v-if="flashcards.length">
          <div class="flashcard-navigation">
            <button
              @click="showPreviousCard"
              :disabled="currentCardIndex === 0"
            >
              Previous
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
            >
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
              <button
                v-if="!answers[selectedAnswerIndex].correct"
                @click="retryQuestion"
                class="retry-button"
              >
                Retry Question
              </button>
            </div>
            <div class="source" v-if="showSource">
              <p class="quote">{{ currentCard.quote || "" }}</p>
              <p class="reference">Page {{ currentCard.page }}</p>
            </div>
          </div>
        </div>
        <div v-else-if="generating" class="loading">
          Generating flashcards...
        </div>
        <div v-else class="info-message">No flashcards available.</div>
      </div>

      <div class="section chat-assistant">
        <h2>Study Assistant Chat</h2>
        <div id="chat-history">
          <div
            v-for="(message, index) in chatMessages"
            :key="index"
            :class="[
              'chat-message',
              message.isUser ? 'user-message' : 'bot-message',
            ]"
          >
            {{ message.content }}
          </div>
        </div>
        <div class="chat-input-container">
          <input
            type="text"
            style="border:none;
                    width:95%;
                    outline:none"
            v-model="chatInput"
            placeholder="Ask a question about the content..."
            @keypress.enter="sendMessage"
          />
          <button @click="sendMessage">↑</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";

const pdfInput = ref(null);
const uploadStatus = ref("");
const uploadBtnText = ref("Upload PDF");
const uploading = ref(false);
const generateBtnText = ref("Generate Flashcards");
const generating = ref(false);

const currentFileId = ref(null);
const flashcards = ref([]);
const currentCardIndex = ref(0);
const currentCardAnswered = ref(false);
const selectedAnswerIndex = ref(null);
const feedbackMessage = ref("");
const showSource = ref(false);

const answers = ref([]);

const chatInput = ref("");
const chatMessages = ref([]);

const currentCard = computed(() => flashcards.value[currentCardIndex.value]);

const uploadPdf = async () => {
  const file = pdfInput.value.files[0];
  if (!file) {
    alert("Please select a PDF file first.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

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

    currentFileId.value = response.data.file_id;
    uploadStatus.value = `PDF uploaded successfully! ${response.data.num_pages} pages found.`;
  } catch (error) {
    console.error("Error uploading PDF:", error);
    uploadStatus.value = "Error uploading PDF. Please try again.";
  } finally {
    uploading.value = false;
    uploadBtnText.value = "Upload PDF";
  }
};

const generateFlashcards = async () => {
  if (!currentFileId.value) {
    alert("Please upload a PDF first.");
    return;
  }

  try {
    generating.value = true;
    generateBtnText.value = "Generating...";

    const response = await axios.post(
      "http://127.0.0.1:5000/api/generate-flashcards",
      {
        file_id: currentFileId.value,
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
    uploadStatus.value = `Error generating flashcards: ${
      error.response?.data?.error || error.message
    }`;
  } finally {
    generating.value = false;
    generateBtnText.value = "Generate Flashcards";
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
  currentCardAnswered.value = true;
  showSource.value = true;

  const answer = answers.value[index];
  if (answer.correct) {
    feedbackMessage.value = '<p class="correct">Correct! Well done!</p>';
  } else {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/explain-answer",
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
  return answers.value[index].correct ? "correct" : "incorrect";
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

const sendMessage = async () => {
  const message = chatInput.value.trim();
  if (!message) return;

  chatMessages.value.push({ content: message, isUser: true });
  chatInput.value = "";

  try {
    const response = await axios.post("http://127.0.0.1:5000/api/chat", {
      message,
      file_id: currentFileId.value,
    });
    chatMessages.value.push({ content: response.data.response, isUser: false });
  } catch (error) {
    console.error("Error sending message:", error);
    chatMessages.value.push({
      content: "Sorry, there was an error processing your message.",
      isUser: false,
    });
  }
};
</script>

<style scoped>
/* Define component-specific variables */
.container {
  --primary-color: #6c5dd3;
  --secondary-color: #f5f5f5;
  --text-color: #333;
  --border-radius: 8px;
}

/* Apply styles only within this component */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: #f0f2f5;
}

.container * {
  margin: 0;
  padding: 5px;
  box-sizing: border-box;
}

.container header {
  text-align: center;
  margin-bottom: 40px;
}

.container h1 {
  color: var(--primary-color);
  margin-bottom: 20px;
}

.container .section {
  background: white;
  padding: 20px;
  border-radius: var(--border-radius);
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container textarea {
  width: 100%;
  height: 200px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  resize: vertical;
}

.container button {
  background-color: var(--primary-color);
  color: blue;
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.3s;
}

.container button:hover {
  background-color: #357abd;
}

.container .flashcard {
  background: white;
  padding: 20px;
  border-radius: 8px;
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
  color: #333;
}

.container .answer-choice:hover:not([disabled]) {
  background: #f5f5f5;
}

.container .answer-choice.correct {
  background-color: #4caf50;
  color: white;
}

.container .answer-choice.incorrect {
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
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  margin-top: 10px;
}

.container .retry-button:hover {
  background-color: #5a4caf;
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

.container .chat-container {
  height: 400px;
  overflow-y: auto;
  padding: 20px;
  background: var(--secondary-color);
  border-radius: var(--border-radius);
  margin-bottom: 20px;
}

.container .chat-message {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: var(--border-radius);
}

.container .user-message {
  background: var(--primary-color);
  color: white;
  margin-left: 20%;
}

.container .bot-message {
  background: white;
  border: 1px solid #ddd;
  margin-right: 20%;
}

.container .chat-input-container {
  display: flex;
  height: 50px;
  gap: 10px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  justify-content:space-between
}

.container #chat-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
}

.container .loading {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>
