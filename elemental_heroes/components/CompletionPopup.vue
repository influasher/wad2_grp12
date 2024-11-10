<!-- components/CompletionPopup.vue -->
<template>
    <div v-if="show" class="popup-overlay">
        <div class="popup-content">
            <h2>Good job!</h2>
            <p>You've completed all the flashcards!</p>
            <div class="popup-buttons">
                <button class="return-button" @click="handleReturn">
                    Return Home
                </button>
                <button 
                    v-if="mode === 'generate'" 
                    class="generate-button" 
                    @click="onGenerateMore"
                >
                    Generate More
                </button>
                <button 
                    v-else-if="mode === 'review'" 
                    class="review-button" 
                    @click="handleRestart"
                >
                    Review Again
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

defineProps({
    show: {
        type: Boolean,
        required: true
    },
    onGenerateMore: {
        type: Function,
        required: false
    },
    mode: {
        type: String,
        required: true,
        validator: (value) => ['generate', 'review'].includes(value)
    }
});

const emit = defineEmits(['restart']);

const handleReturn = () => {
    router.push('/');
};

const handleRestart = () => {
    emit('restart');
};
</script>

<style scoped>
.popup-overlay {
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

.popup-content {
    background: white;
    padding: 30px;
    border-radius: var(--border-radius);
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 90%;
}

.popup-content h2 {
    color: var(--button-color);
    margin-bottom: 15px;
}

.popup-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
}

.popup-buttons button {
    flex: 1;
    max-width: 200px;
    background-color: var(--button-color);
    border-radius: var(--border-radius);
    border: none;
    color: white;
    transition: background-color 0.3s;
    cursor: pointer;
    padding: 5px;
}

.popup-buttons button:hover{
    background-color: var(--button-hover);
}
</style>