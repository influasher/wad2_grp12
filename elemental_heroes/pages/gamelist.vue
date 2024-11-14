<template>
  <div class="game-page">
    <div class="row custom-row mb-3 justify-content-center">
      <div class="col-12 d-flex flex-wrap justify-content-center">
        <div v-for="(tag, index) in tags" :key="index" class="mb-2 me-2">
          <button
            class="btn rounded-pill my-1"
            :class="`${tag.colorClass} text-white`"
            disabled
          >
            <span>{{ tag.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="row custom-row justify-content-center">
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

      <div class="col-12 d-flex justify-content-center d-lg-none">
        <div class="card not-playable-card">
          <div class="card-body">
            <h3 class="card-title text-center">
              Play the game on a laptop for optimal experience
            </h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js" setup>
import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#app';
import CarouselSkeleton from '~/components/CarouselSkeleton.vue';
const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)

//use this to get the supabase user
const user = useSupabaseUser()


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
.custom-row {
  --bs-gutter-x: 0;
}
.game-page {
  padding: 10px;
}

#game-container {
  width: 60vw;
  height: auto;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

#subjects {
  margin-top: 10px;
  padding: 20px;
}

button:disabled {
  opacity: 1 !important;
  pointer-events: none;
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
}

.card-body {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
