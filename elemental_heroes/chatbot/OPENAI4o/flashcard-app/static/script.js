// static/script.js
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
    let flashcards = [];
    let currentCardIndex = 0;
    let currentCardAnswered = false;

    function generateAnswerChoices(card) {
        // Combine correct and wrong answers
        let answers = [
            { text: card.answer, correct: true },
            ...card.wrong_answers.map(wrongAnswer => {
                // Handle both string and object formats for wrong answers
                return {
                    text: typeof wrongAnswer === 'string' ? wrongAnswer : wrongAnswer.text,
                    correct: false
                };
            })
        ];
        
        // Shuffle the answers
        return shuffleArray(answers);
    }

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
            
            console.log('Flashcards response:', response.data);
    
            if (response.data.flashcards && Array.isArray(response.data.flashcards)) {
                flashcards = response.data.flashcards;
                currentCardIndex = 0;
                currentCardAnswered = false;
                displayCurrentCard();
            } else {
                throw new Error('Invalid flashcard data format');
            }
        } catch (error) {
            console.error('Error generating flashcards:', error);
            flashcardsContainer.innerHTML = `
                <div class="error-message">
                    Error generating flashcards. Please try again.
                    <br>
                    ${error.response?.data?.error || error.message}
                </div>`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Flashcards';
        }
    });

    function displayCurrentCard() {
        if (!flashcards.length) {
            flashcardsContainer.innerHTML = '<div class="error-message">No flashcards available.</div>';
            return;
        }

        const card = flashcards[currentCardIndex];
        const answers = generateAnswerChoices(card);
        
        flashcardsContainer.innerHTML = `
            <div class="flashcard-navigation">
                <button id="prev-btn" ${currentCardIndex === 0 ? 'disabled' : ''}>Previous</button>
                <span>Card ${currentCardIndex + 1} of ${flashcards.length}</span>
                <button id="next-btn" ${!currentCardAnswered ? 'disabled' : ''}>Next</button>
            </div>
            <div class="flashcard">
                <div class="question">${card.question}</div>
                <div class="answer-choices">
                    ${answers.map((answer, index) => `
                        <button class="answer-choice" data-index="${index}">
                            ${answer.text}
                        </button>
                    `).join('')}
                </div>
                <div class="feedback" style="display: none;"></div>
                <div class="source" style="display: none;">
                    <p class="quote">${card.quote || ''}</p>
                    <p class="reference">Page ${card.page}</p>
                </div>
            </div>
        `;

        // Add event listeners
        document.getElementById('prev-btn')?.addEventListener('click', showPreviousCard);
        document.getElementById('next-btn')?.addEventListener('click', showNextCard);
        
        // Add event listeners for answer choices
        document.querySelectorAll('.answer-choice').forEach(button => {
            button.addEventListener('click', () => handleAnswerChoice(button, answers));
        });
    }
    
    async function handleAnswerChoice(button, answers) {
        const answerIndex = parseInt(button.dataset.index);
        const answer = answers[answerIndex];
        const feedbackDiv = document.querySelector('.feedback');
        const sourceDiv = document.querySelector('.source');
    
        // Disable all answer buttons temporarily
        document.querySelectorAll('.answer-choice').forEach(btn => {
            btn.disabled = true;
        });
    
        feedbackDiv.style.display = 'block';
        sourceDiv.style.display = 'block';
    
        if (answer.correct) {
            button.classList.add('correct');
            feedbackDiv.innerHTML = '<p class="correct">Correct! Well done!</p>';
            currentCardAnswered = true;
            document.getElementById('next-btn').disabled = false;
        } else {
            button.classList.add('incorrect');
            
            try {
                // Get explanation from GPT-4-mini
                const response = await axios.post('/api/explain-answer', {
                    question: flashcards[currentCardIndex].question,
                    correct_answer: answers.find(a => a.correct).text,
                    wrong_answer: answer.text
                });
                
                feedbackDiv.innerHTML = `
                    <p class="incorrect">Incorrect.</p>
                    <p>${response.data.explanation}</p>
                    <button class="retry-button">Retry Question</button>
                `;
    
                // Add event listener for retry button
                const retryButton = feedbackDiv.querySelector('.retry-button');
                retryButton.addEventListener('click', () => {
                    // Re-enable all answer buttons
                    document.querySelectorAll('.answer-choice').forEach(btn => {
                        btn.disabled = false;
                        btn.classList.remove('correct', 'incorrect');
                    });
                    feedbackDiv.style.display = 'none';
                    sourceDiv.style.display = 'none';
                });
            } catch (error) {
                console.error('Error getting explanation:', error);
                feedbackDiv.innerHTML = `
                    <p class="incorrect">Incorrect. Please try again.</p>
                    <button class="retry-button">Retry Question</button>
                `;
            }
        }
    }

    function showPreviousCard() {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            currentCardAnswered = true; // Allow going back through answered cards
            displayCurrentCard();
        }
    }

    function showNextCard() {
        if (currentCardIndex < flashcards.length - 1 && currentCardAnswered) {
            currentCardIndex++;
            currentCardAnswered = false;
            displayCurrentCard();
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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

    // PDF Upload handler
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
});
