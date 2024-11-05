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
                <h3 class="card-title">{{ game.title }}<span v-if="!isGamePlayable(game.id)" class="ms-2">[Coming Soon]</span></h3>
                <p class="card-text">{{ game.description }}</p>
                <!-- <button type="button" class="btn btn-primary"   :disabled="!isGamePlayable(game.id)"
                >Play</button> -->
                <router-link v-if="isGamePlayable(game.id)" to="/gamelist">
                <button type="button" class="btn btn-primary">Play</button>
                </router-link>
                <button v-else type="button" class="btn btn-primary" disabled>Play</button>
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

    <!-- <div class="leaderboard mt-4">
      <h3 class="text-center">Leaderboard</h3>
       <ul class="list-group">
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>User</span>
          <span>Score</span>
          <span>Games played</span>
        </li>
        <li
          v-for="(profile, index) in leaderboard"
          :key="profile.id"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <span>{{ index + 1 }}. {{ profile.first_name }} {{ profile.last_name }}</span>
          <span class="badge bg-primary rounded-pill">{{ profile.score }}</span>
          <span class="badge bg-primary rounded-pill">{{ profile.games_played }}</span>
        </li>
      </ul> 
      <canvas id="leaderboardChart"></canvas>

    </div> -->

    <div class="leaderboard-container">
      <h3 class="leaderboard-title">Leaderboard</h3>
      <!-- <div class="top-three">
        <div v-for="(profile, index) in leaderboard.slice(0, 3)" :key="profile.id" class="leaderboard-card top-card" :class="getCardClass(index)">
          <div class="rank-number">{{ index + 1 }}</div>
          <div class="avatar">
            <img :src="profile.avatar || '/default-avatar.png'" alt="User Avatar" />
          </div>
          <div class="user-info">
            <div class="user-name">{{ profile.first_name }} {{ profile.last_name }}</div>
            <div class="user-score">{{ profile.score }} pts</div>
          </div>
        </div>
      </div> -->
      <div class="top-three">
        <div v-for="(profile, index) in leaderboard.slice(0, 3)" 
            :key="profile.id" 
            class="leaderboard-card top-card" 
            :class="getCardClass(index)"
            :style="{ height: getBarHeight(index) }">
          <div class="rank-number">{{ index + 1 }}</div>
          <div class="avatar">
            <img :src="profile.avatar || '/default-avatar.png'" alt="User Avatar" />
          </div>
          <div class="user-info">
            <div class="user-name">{{ profile.first_name }} {{ profile.last_name }}</div>
            <div class="user-score">{{ profile.score }} pts</div>
          </div>
        </div>
      </div>
      <div class="regular-places">
        <div v-for="(profile, index) in leaderboard.slice(3)" :key="profile.id" class="leaderboard-card">
          <div class="rank-number">{{ index + 4 }}</div>
          <div class="avatar">
            <img :src="profile.avatar || '/default-avatar.png'" alt="User Avatar" />
          </div>
          <div class="user-info">
            <div class="user-name">{{ profile.first_name }} {{ profile.last_name }}</div>
            <div class="user-score">{{ profile.score }} pts</div>
          </div>
        </div>
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
  white-space: nowrap; /* Prevents text from wrapping */

}

/* Add styles for skeleton container */
.skeleton-container {
  width: 100%;
  margin: 0 auto;
}

.leaderboard {
  max-width: 600px;
  margin: 0 auto;
  padding: 10px;
}

.list-group-item {
  background-color: #f9f9f9;
  text-align: center;
}

/* #leaderboardChart {
  width: 100% !important;
  height: 400px !important;
} */

.leaderboard-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 15px;
}

.leaderboard-title {
  /* display: flex; */
  text-align: center;
  font-size: 24px;
  padding-bottom: 20px;
  /* justify-content: center; */
  margin: auto;
  
}

.top-card {
  width: 30%; /* Each top card takes 30% of the width */
  background-color: #ffffff;
  border-radius: 15px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.top-three {
  display: flex;
  justify-content: space-around; /* Spread out the top three cards */
  align-items: flex-end; /* Align cards based on their heights */
  margin-bottom: 20px;
}

.first-place {
  background-color: #ffd700; /* Gold */
  order: 2; /* Position first place in the middle */
}

.second-place {
  background-color: #c0c0c0; /* Silver */
  order: 1; /* Position second place on the left */
}

.third-place {
  background-color: #cd7f32; /* Bronze */
  order: 3; /* Position third place on the right */
}

/* Add custom heights for visualization */
.top-card {
  flex: 1;
  border-radius: 15px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}


.rank-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.user-info {
  text-align: center;
}

.user-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.user-score {
  font-size: 14px;
  color: #666;
}

.regular-places .leaderboard-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  margin-bottom: 10px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}


</style>

<script setup>
import { ref, onMounted } from "vue";
import { createClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from "#app";
import CarouselSkeleton from "~/components/CarouselSkeleton.vue";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);
Chart.register(...registerables);

const config = useRuntimeConfig();
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseKey
);
const games = ref([]);
const isLoading = ref(true);
const leaderboard = ref([]); // Initialize leaderboard as a ref


function getBarHeight(index) {
  switch (index) {
    case 0:
      return '280px'; // Highest for 1st place
    case 1:
      return '230px'; // Second highest for 2nd place
    case 2:
      return '200px'; // Lowest for 3rd place
    default:
      return '100px';
  }
}


async function fetchGames() {
  try {
    isLoading.value = true;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { data, error } = await supabase
      .from("games")
      .select("id, title, description, thumbnail_url");

      console.log(data)

    if (error) throw error;

    games.value = data;
    await Promise.all(games.value.map(fetchThumbnail));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    isLoading.value = false;
  }
}


// async function fetchLeaderboard() {
//   try {
//     const { data, error } = await supabase
//       .from("profiles")
//       .select("id, first_name, last_name, score, games_played")
//       .order("score", { ascending: false });

//     if (error) throw error;
//     leaderboard.value = data;

//     renderLeaderboardChart();
//   } catch (error) {
//     console.error("Error fetching leaderboard:", error.message);
//   }
// }


// function renderLeaderboardChart() {
//   const ctx = document.getElementById("leaderboardChart").getContext("2d");

//   new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels: leaderboard.value.map(
//         (profile) => `${profile.first_name} ${profile.last_name}`
//       ),
//       datasets: [
//         {
//           label: "Score",
//           data: leaderboard.value.map((profile) => profile.score),
//           backgroundColor: leaderboard.value.map((_, index) => {
//             if (index < 3) {
//               return 'rgba(89, 63, 255, 0.7)'; // Top 3: Green with 0.7 transparency
//             } else if (index < 5) {
//               return 'rgba(139, 110, 243, 0.7)'; // Next 2: Yellow with 0.7 transparency
//             } else {
//               return 'rgba(178, 169, 236, 0.7)'; // Rest: Red with 0.7 transparency
//             }
//           }),
//           borderColor: leaderboard.value.map((_, index) => {
//             return index === 1 ? 'rgba(42, 42, 43, 0.7)' : 'transparent'; // Add a black border to the user's bar, transparent for others
//           }),
//           borderWidth: leaderboard.value.map((_, index) => {
//             return index === 1 ? 3 : 0; // Set border width for the user's bar
//           }),
//           borderRadius: 10, // Set this to round the corners of the bars
//           borderSkipped: false, // Ensure rounding applies to all sides
//         },
//       ],
//     },
//     options: {
//       indexAxis: "y", // Horizontal bar chart
//       responsive: true,
//       scales: {
//         x: {
//           display: false, // Hide the x-axis grid lines
//         },
//         y: {
//           grid: {
//             display: false, // Hide the y-axis grid lines
//           },
//           ticks: {
//             autoSkip: false, // Ensure all labels are shown
//           },
//         },
//       },
//       plugins: {
//         legend: {
//           display: false,
//         },
//         datalabels: {
//           display: true, // Enable data labels
//           align: 'end',
//           anchor: 'end',
//           color: '#000', // Adjust color as needed
//           font: {
//             size: 12, // Adjust font size as needed
//           },
//         },
//       },
//     },
//     plugins: [ChartDataLabels], // Include the ChartDataLabels plugin
//   });
// }

async function fetchLeaderboard() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, score')
      .order('score', { ascending: false });

    if (error) throw error;

    leaderboard.value = await Promise.all(
      data.map(async (profile) => {
        const avatarPath = `avatars/${profile.first_name.toLowerCase()}_${profile.last_name.toLowerCase()}.png`;
        const { data: avatarData, error: avatarError } = await supabase
          .storage
          .from('files_wad2')
          .getPublicUrl(avatarPath);

        if (avatarError) {
          console.error('Error fetching avatar:', avatarError.message);
          profile.avatar = '/default-avatar.png'; // Fallback to a default image if there's an error
        } else {
          profile.avatar = avatarData.publicUrl || '/default-avatar.png';
        }
        return profile;
      })
    );

  } catch (error) {
    console.error('Error fetching leaderboard:', error.message);
  }
}

function getCardClass(index) {
  if (index === 0) return 'first-place';
  if (index === 1) return 'second-place';
  if (index === 2) return 'third-place';
  return 'regular-place';
}


const playableGameId = ref(1); // Assuming game with ID 1 is the only playable one

function isGamePlayable(gameId) {
  return gameId === playableGameId.value;
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
  fetchLeaderboard();
});
</script>
