<template>
  <div class="game-page">
    <div class="row justify-content-center">
      <!-- Game container: Full width on small screens, 10 columns on large screens -->
      <div id="game-container" class="screen col-lg-12 col-xl-9">
      </div>

      <!-- Topics section: Full width on small screens, 2 columns on large screens -->
      <div id="subjects" class="col-lg-12 col-xl-3 d-flex justify-content-center">
        <div class="card custom-card">
            <div class="card-body">
              <h3 class="card-title">Topics Covered</h3>
              <span class="badge rounded-pill text-bg-primary">Titration</span>
              <span class="badge rounded-pill text-bg-success">QA</span>
              <span class="badge rounded-pill text-bg-danger">Metals</span>
              <span class="badge rounded-pill text-bg-warning">Electrochemistry</span>
              <span class="badge rounded-pill text-bg-info">Organic</span>
            </div>
      </div>
      </div>
    </div>
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
.game-page {
  padding: 10px;
}

#game-container, #not-playable {
            width: 60vw;               /* Set the fixed width of the game */
            height: auto;              /* Set the fixed height of the game */
            /* background-color: palevioletred;  Light background color */
            /* box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1); Soft shadow for effect */
            /* border-radius: 10px;        Rounded corners for a modern look */
            padding: 10px;              /* Add padding inside the container */
            display: flex;
            justify-content: center;    /* Center the game inside the container */
            align-items: center;        /* Center the game vertically inside */
        }

#subjects {
  margin-top: 10px;
  padding: 20px;
}

.custom-card {
  width: 100%;
  border: 1px solid #e4e3e3;
}

.badge {
  font-size: 20px;
  font-weight: light;
  margin: 10px;
}
</style>
