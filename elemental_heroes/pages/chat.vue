<template>
    <div class="floating-chat-container">
        <button class="floating-chat-button" @click="toggleChat" :class="{ 'chat-open': isOpen }">
            <span>{{ isOpen ? '×' : '💬' }}</span>
        </button>

        <div v-if="isOpen" class="chat-popup">
            <div class="chat-popup-header">Study Assistant</div>
            <div class="chat-messages">
                <div v-for="(message, index) in chatMessages" 
                    :key="index" 
                    :class="['chat-message', message.isUser ? 'user-message' : 'bot-message']"
                >
                    <div v-if="message.isUser">{{ message.content }}</div>
                    <div v-else class="formatted-content" v-html="formatMessage(message.content)"></div>
                </div>
            </div>
            <div class="chat-input-container">
                <div class="input-wrapper">
                    <input 
                        type="text" 
                        v-model="chatInput" 
                        @keypress.enter="sendMessage" 
                        placeholder="Ask a question..." 
                    />
                    <button 
                        @click="sendMessage"
                        class="send-button"
                        :disabled="!chatInput.trim()"
                    >
                        ↑
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

marked.setOptions({
    highlight: (code, lang) => lang && hljs.getLanguage(lang) 
        ? hljs.highlight(code, { language: lang }).value 
        : hljs.highlightAuto(code).value,
    breaks: true,
    gfm: true
});

const props = defineProps({
    fileId: {
        type: String,
        required: true,
    },
});

const isOpen = ref(false);
const chatInput = ref("");
const chatMessages = ref([]);

const formatMessage = (content) => {
    return DOMPurify.sanitize(marked(content), {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'blockquote', 
                        'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                        'a', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'class', 'target']
    });
};

const toggleChat = () => isOpen.value = !isOpen.value;

const sendMessage = async () => {
    const message = chatInput.value.trim();
    if (!message) return;

    chatMessages.value.push({ content: message, isUser: true });
    chatInput.value = "";

    try {
        const response = await axios.post("http://127.0.0.1:5000/api/chat", {
            message,
            file_id: props.fileId,
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
.floating-chat-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}

.floating-chat-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: rgb(139, 110, 243);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 24px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.floating-chat-button:hover {
    transform: scale(1.1);
}

.floating-chat-button.chat-open {
    background-color: #5a4caf;
}

.chat-popup {
    position: absolute;
    bottom: 80px;
    right: 0;
    width: min(400px, calc(100vw - 40px));
    height: min(500px, calc(100vh - 120px));
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

@media (max-width: 480px) {
    .chat-popup {
        right: -20px;
        width: calc(100vw - 20px);
    }
}

.chat-popup-header {
    padding: 15px;
    background-color: rgb(139, 110, 243);
    color: white;
    font-weight: bold;
    text-align: center;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.chat-message {
    padding: 10px;
    border-radius: 8px;
    max-width: 80%;
    word-wrap: break-word;
}

.user-message {
    background-color: rgb(139, 110, 243);
    color: white;
    align-self: flex-end;
}

.bot-message {
    background-color: #f0f2f5;
    color: #333;
    align-self: flex-start;
}

.formatted-content {
    line-height: 1.5;
}

.formatted-content :deep(p) { margin: 0.5em 0; }

.formatted-content :deep(code) {
    background-color: #f3f3f3;
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9em;
}

.formatted-content :deep(pre) {
    background-color: #f8f8f8;
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0.5em 0;
}

.formatted-content :deep(pre code) {
    background-color: transparent;
    padding: 0;
}

.formatted-content :deep(ul, ol) {
    margin: 0.5em 0;
    padding-left: 1.5em;
}

.formatted-content :deep(li) { margin: 0.25em 0; }

.formatted-content :deep(blockquote) {
    border-left: 3px solid rgb(139, 110, 243);
    margin: 0.5em 0;
    padding-left: 1em;
    color: #666;
}

.formatted-content :deep(a) {
    color: rgb(139, 110, 243);
    text-decoration: none;
}

.formatted-content :deep(a:hover) {
    text-decoration: underline;
}

.chat-input-container {
    padding: 10px;
    border-top: 1px solid #eee;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}

.input-wrapper input {
    width: 100%;
    padding: 12px;
    padding-right: 40px;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;
    font-size: 14px;
    transition: border-color 0.3s;
}

.input-wrapper input:focus {
    border-color: rgb(139, 110, 243);
}

.send-button {
    position: absolute;
    right: 8px;
    background: rgb(139, 110, 243);
    color: white;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    transition: transform 0.2s, background-color 0.3s;
    padding: 0;
}

.send-button:hover {
    background-color: #5a4caf;
    transform: rotate(90deg) scale(1.1);
}

.send-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: rotate(-90deg);
}
</style>