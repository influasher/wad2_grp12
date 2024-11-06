<template>
  <div class="game-page">
    <div class="row mb-3 justify-content-center">
      <div class="col-12 d-flex flex-wrap justify-content-center">
        <div v-for="(tag, index) in tags" :key="index" class="mb-2 me-2">
          <button
            class="btn rounded-pill my-1"
            :class="`${tag.colorClass} text-white`"
          >
            <span>{{ tag.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="row justify-content-center">
      <!-- Game container: Full width on small screens, 10 columns on large screens -->
      <div
        id="game-container"
        class="screen col-12 col-xl-9 d-none d-lg-block"
      ></div>

      <div
        v-if="loading"
        class="col-12 d-flex justify-content-center loading-card"
      >
        <CarouselSkeleton />
      </div>

      <!-- Message card: Visible only on screens smaller than large -->
      <div class="col-12 d-flex justify-content-center d-lg-none">
        <div class="card not-playable-card">
          <div class="card-body">
            <h3 class="card-title text-center">
              Play the game on a laptop for optimal experience
            </h3>
          </div>
        </div>
      </div>

      <!-- Topics section: Full width on small screens, 2 columns on large screens -->
      <!-- <div id="subjects" class="col-12 col-xl-3 d-flex justify-content-center">
        <div class="card custom-card">
            <div class="card-body p-4 ">
              <h3 class="card-title">Topics Covered</h3>
              <div class="row">
                <div class="col-6 mb-2" v-for="(tag, index) in tags" :key="index">
                  <button 
                    class="btn rounded-pill my-1 w-100 d-flex align-items-center justify-content-start"
                    :class="tag.colorClass"
                  >
                    <i :class="tag.icon" class="me-2" :style="{ color: tag.color }"></i>
                    {{ tag.label }}
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script lang="js" setup>
import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#app';
import CarouselSkeleton from '~/components/CarouselSkeleton.vue';
const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)
// import PhaserGame from 'nuxtjs-phaser/phaserGame.vue';

let gameInstance;
const loading = ref(true);

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
  loading.value = false;
  nextTick(() => setPhaserFocus());
});




async function updateScores() {
  const { error } = await supabase
    .from('profiles')
    .update({ score: score.value })
    .eq('id', id.value);
    console.log(data)

  if (error) {
    console.error('Error updating score:', error.message);
  } else {
    console.log('Score updated successfully');
  }
}

function handleSubmit() {
  updateScores();
}

const tags = ref([
  { label: 'Science', colorClass: 'bg-primary bg-gradient' },
  { label: 'Organic', colorClass: 'bg-success bg-gradient' },
  { label: 'Metals', colorClass: 'bg-danger bg-gradient' },
  { label: 'Titration', colorClass: 'bg-warning bg-gradient' },
  { label: 'QA', colorClass: 'bg-info bg-gradient' },
  { label: 'Periodic Table', colorClass: 'bg-secondary bg-gradient' },
  { label: 'Chemistry', colorClass: 'bg-primary bg-gradient' },
]);
</script>

<style scoped>
.game-page {
  padding: 10px;
}

#game-container {
  width: 60vw; /* Set the fixed width of the game */
  height: auto; /* Set the fixed height of the game */
  padding: 10px; /* Add padding inside the container */
  display: flex;
  justify-content: center; /* Center the game inside the container */
  align-items: center; /* Center the game vertically inside */
}

#subjects {
  margin-top: 10px;
  padding: 20px;
}

.custom-card {
  width: 100%;
  border: 1px solid #1e1e1e;
}

.custom-card:hover {
  action: none;
}

.btn-light {
  background-color: #f9f9f9;
  border-radius: 15px;
  height: 40px;
  padding: 1px;
}

.badge {
  font-size: 20px;
  font-weight: light;
  margin: 5px;
  border-radius: 10px;
  width: 40%;
}

.loading-card {
  width: 60vw;
  height: 500px;
  text-align: center;
  border: 1px solid #e4e3e3;
}

.card-body {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
