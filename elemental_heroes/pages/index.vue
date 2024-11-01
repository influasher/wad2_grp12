<!-- pages/index.vue -->
<template>
  <div class="home-page">
    <!-- Announcements Section -->
    <div class="announcements">
      <h3>Announcements</h3>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Suscipit
        molestias nostrum corporis voluptates quae laborum quos enim, voluptatem
        neque, deserunt adipisci, veritatis nam aspernatur. Eos iste expedita
        facere officiis odio.
      </p>
    </div>

    <!-- Slideshow of recently played -->
    <div class="slideshow">
      <div v-if="isLoading" class="skeleton-container">
        <CarouselSkeleton />
      </div>

      <div
        v-else
        id="carouselExampleAutoplaying"
        class="carousel slide"
        data-bs-ride="carousel"
      >
        <!-- Your existing carousel code -->
        <div class="carousel-inner">
          <div
            v-for="(game, index) in games"
            :key="game.id"
            :class="['carousel-item', { active: index === 0 }]"
            data-bs-interval="3000"
          >
            <div class="card text-bg-dark mx-auto">
              <img :src="game.publicUrl" :alt="game.title" class="rounded" />
              <div
                class="card-img-overlay d-flex flex-column justify-content-end"
              >
                <h3 class="card-title">{{ game.title }}</h3>
                <p class="card-text">{{ game.description }}</p>
                <button type="button" class="btn btn-primary">Play</button>
              </div>
            </div>
          </div>
        </div>
        <!-- Carousel controls -->
        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleAutoplaying"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleAutoplaying"
          data-bs-slide="next"
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.home-page {
  display: block;
  justify-content: center;
  align-items: center;
  padding-bottom: 20px; /* Add some bottom padding */
}
.announcements {
  display: block;
  background-color: #f5f5f5;
  max-width: 100%;
  padding: 10px;
  margin: 10px;
  h3 {
    text-align: center;
  }

  p {
    text-align: center;
  }
}

.slideshow {
  justify-content: center;
  margin: 10px;
}

.carousel-item img {
  width: 100%;
  /* height: 260px; */
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.card {
  width: 100%;
  max-height: 70vh; /* Use viewport height instead of fixed pixels */
  display: inline-block;
  position: relative;
  overflow: hidden; /*This will crop off image portions that overflow the container*/
}

.card-img-overlay {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    transparent 100%
  );

  padding-left: 18%;
  padding-right: 18%;
  padding-bottom: 5%;
}

.btn {
  background-color: #8b6ef3;
  width: 20%;
}

/* Add styles for skeleton container */
.skeleton-container {
  width: 100%;
  margin: 0 auto;
}
</style>

<script setup>
import { ref, onMounted } from "vue";
import { createClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from "#app";
import CarouselSkeleton from "~/components/CarouselSkeleton.vue";

const config = useRuntimeConfig();
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseKey
);
const games = ref([]);
const isLoading = ref(true);

async function fetchGames() {
  try {
    isLoading.value = true;

    // Add small delay to ensure skeleton is visible during development
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { data, error } = await supabase
      .from("games")
      .select("id, title, description, thumbnail_url");

    if (error) throw error;

    games.value = data;
    await Promise.all(games.value.map(fetchThumbnail));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    isLoading.value = false;
  }
}

async function fetchThumbnail(game) {
  const { data, error } = await supabase.storage
    .from("files_wad2")
    .getPublicUrl(game.thumbnail_url);

  if (!error) {
    game.publicUrl = data.publicUrl;
  }
}

onMounted(() => {
  fetchGames();
});
</script>
