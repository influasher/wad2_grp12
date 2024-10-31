<template>
  <div class="game">gamelists</div>

  <form @submit.prevent="handleSubmit">
    <div>
      <label for="score">Score:</label>
      <input type="number" id="score" v-model="score" />
    </div>
    <div>
      <label for="id">ID:</label>
      <input type="number" id="id" v-model="id" />
    </div>
    <button type="submit">Update Score</button>
  </form>
  <div id="game-container" class="screen">
</div>
</template>

<script lang="js" setup>
import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#app';
const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)
// import PhaserGame from 'nuxtjs-phaser/phaserGame.vue';

let gameInstance;

async function initializeGame(){
  const { initializeGame } = await import('../games/main');
  console.log('loading');
  return initializeGame();
}

const setPhaserFocus = () => {
    const phaserContainer = document.getElementById('game-container');
    if (phaserContainer) phaserContainer.focus();
};

onMounted(async () => {
  gameInstance = await initializeGame();
  nextTick(() => setPhaserFocus());
});




async function updateScores() {
  const { error } = await supabase
    .from('profiles')
    .update({ score: score.value })
    .eq('id', id.value);

  if (error) {
    console.error('Error updating score:', error.message);
  } else {
    console.log('Score updated successfully');
  }
}

function handleSubmit() {
  updateScores();
}


</script>

<style>
#game-container, #not-playable {
            width: 60vw;               /* Set the fixed width of the game */
            height: 85vh;              /* Set the fixed height of the game */
            background-color: palevioletred;  /* Light background color */
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1); /* Soft shadow for effect */
            border-radius: 10px;        /* Rounded corners for a modern look */
            padding: 20px;              /* Add padding inside the container */
            display: flex;
            justify-content: center;    /* Center the game inside the container */
            align-items: center;        /* Center the game vertically inside */
            margin-left: 10vw;
        }
</style>
