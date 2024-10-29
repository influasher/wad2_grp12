document.addEventListener('DOMContentLoaded', function() {
    const pdfInput = document.getElementById('pdf-input');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadStatus = document.getElementById('upload-status');
    const generateBtn = document.getElementById('generate-btn');
    const flashcardsContainer = document.getElementById('flashcards-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatHistory = document.getElementById('chat-history');

    let currentFileId = null;

    // PDF Upload
    uploadBtn.addEventListener('click', async function() {
        const file = pdfInput.files[0];
        if (!file) {
            alert('Please select a PDF file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Uploading...';
            uploadStatus.textContent = 'Uploading PDF...';

            const response = await axios.post('/api/upload-pdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            currentFileId = response.data.file_id;
            uploadStatus.textContent = `PDF uploaded successfully! ${response.data.num_pages} pages found.`;
            generateBtn.disabled = false;
        } catch (error) {
            console.error('Error uploading PDF:', error);
            uploadStatus.textContent = 'Error uploading PDF. Please try again.';
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload PDF';
        }
    });

    // Flashcard Generation
    generateBtn.addEventListener('click', async function() {
        if (!currentFileId) {
            alert('Please upload a PDF first.');
            return;
        }

        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
            flashcardsContainer.innerHTML = '<div class="loading">Generating flashcards...</div>';

            const response = await axios.post('/api/generate-flashcards', { file_id: currentFileId });
            displayFlashcards(response.data.flashcards);
        } catch (error) {
            console.error('Error generating flashcards:', error);
            flashcardsContainer.innerHTML = 'Error generating flashcards. Please try again.';
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Flashcards';
        }
    });

    function displayFlashcards(flashcards) {
        flashcardsContainer.innerHTML = '';
        flashcards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'flashcard';
            cardElement.innerHTML = `
                <div class="flashcard-content">
                    <div class="question">${card.question}</div>
                    <div class="answer" style="display: none;">
                        <p>${card.answer}</p>
                        <div class="source">
                            <p class="quote">${card.quote || ''}</p>
                            <p class="reference">Page ${card.page} 
                                <a href="/uploads/${card.pdf_filename}" target="_blank">(View PDF)</a>
                            </p>
                        </div>
                    </div>
                </div>
            `;
            
            cardElement.addEventListener('click', () => {
                const answer = cardElement.querySelector('.answer');
                const question = cardElement.querySelector('.question');
                if (answer.style.display === 'none') {
                    answer.style.display = 'block';
                    question.style.display = 'none';
                } else {
                    answer.style.display = 'none';
                    question.style.display = 'block';
                }
            });

            flashcardsContainer.appendChild(cardElement);
        });
    }

    // Chat Functionality
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        appendMessage(message, true);
        chatInput.value = '';

        try {
            const response = await axios.post('/api/chat', { 
                message,
                file_id: currentFileId // Include file_id if available
            });
            appendMessage(response.data.response, false);
        } catch (error) {
            console.error('Error sending message:', error);
            appendMessage('Sorry, there was an error processing your message.', false);
        }
    }

    function appendMessage(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = content;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
});