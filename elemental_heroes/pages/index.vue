<!-- pages/index.vue -->
<template>
  <div class="home-page">
    <!-- Announcements Section -->
    <!-- <div class="announcements">
      <h3>Announcements</h3>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Suscipit
        molestias nostrum corporis voluptates quae laborum quos enim, voluptatem
        neque, deserunt adipisci, veritatis nam aspernatur. Eos iste expedita
        facere officiis odio.
      </p>
    </div> -->
    <div class="my-3 py-3">
      <h1 id="typed-output" class="press-start-2p-regular"></h1> 
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
                <h3 class="card-title">
                  {{ game.title
                  }}<span v-if="!isGamePlayable(game.id)" class="ms-2"
                    >[Coming Soon]</span
                  >
                </h3>
                <p class="card-text d-none d-md-block">
                  {{ game.description }}
                </p>
                <!-- <button type="button" class="btn btn-primary"   :disabled="!isGamePlayable(game.id)"
                >Play</button> -->
                <router-link v-if="isGamePlayable(game.id)" to="/gamelist">
                  <button type="button" class="btn btn-primary btn-responsive">
                    Play
                  </button>
                </router-link>
                <button
                  v-else
                  type="button"
                  class="btn btn-primary btn-responsive"
                  disabled
                >
                  Play
                </button>
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

    <div v-if="isLoading" class="leaderboard-skeleton">
      <CarouselSkeleton />
    </div>

    <div v-else class="leaderboard-container">
      <h3 class="leaderboard-title fs-5 press-start-2p-regular">Leaderboard</h3>
      <div class="top-three press-start-2p-regular">
        <div
          v-for="(profile, index) in leaderboard.slice(0, 3)"
          :key="profile.id"
          class="leaderboard-card top-card"
          :class="getCardClass(index)"
          :style="{ height: getBarHeight(index) }"
        >
          <div class="rank-number">{{ index + 1 }}</div>
          <div class="avatar">
            <img :src="profile.avatar || '/assets/images/coolAvatar.png'" />
          </div>
          <div class="user-info">
            <div class="user-name">
              {{ profile.first_name }} {{ profile.last_name }}
            </div>
            <div class="user-score">{{ profile.score }} pts</div>
          </div>
        </div>
      </div>
      <div class="regular-places press-start-2p-regular">
        <div
          v-for="(profile, index) in leaderboard.slice(3)"
          :key="profile.id"
          class="leaderboard-card row"
        >
          <div class="rank-number col-4">{{ index + 4 }}</div>
          <div class="avatar col-4">
            <img :src="profile.avatar || '/assets/images/coolAvatar.png'" />
          </div>
          <div class="user-info text-end col-4">
            <div class="user-name">
              {{ profile.first_name }} {{ profile.last_name }}
            </div>
            <div class="user-score">{{ profile.score }} pts</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.press-start-2p-regular {
  font-family: "Press Start 2P", serif;
  font-weight: 400;
  font-style: normal;
}

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

.btn-responsive {
  background-color: #8b6ef3;
  padding: 0.5rem 2rem;
  white-space: nowrap;
  min-width: 100px;
  max-width: 200px; /* Add this to limit maximum width */
  width: fit-content; /* Add this to make button fit content */
  margin-top: 1rem;
  display: inline-block; /* Add this to maintain button width */
}

.btn-responsive:disabled {
  background-color: #8b6ef3;
  opacity: 0.65;
  width: fit-content;
  display: inline-block;
}

/* Add styles for skeleton container */
.skeleton-container {
  width: 100%;
  margin: 0 auto;
}

.leaderboard {
  /* max-width: 600px; */
  margin: 0 auto;
  padding: 10px;
}

.list-group-item {
  background-color: #f9f9f9;
  text-align: center;
}

.leaderboard-container {
  /* max-width: 800px; */
  margin: 10px;
  /* margin: 0 auto; */
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 15px;
}

.leaderboard-skeleton {
  /* max-width: 800px; */
  margin: 10px;
  /* margin: 0 auto; */
  border-radius: 15px;
  /* padding: 20px; */
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
  /* max-width: 800px; */
  display: flex;
  /* justify-content: space-around;  */
  justify-content: space-evenly;
  align-items: flex-end;
  margin-bottom: 20px;
  /* Centers the cards with equal spacing */
  gap: 30px; /* Adjust spacing as needed */
  margin-left: 10px;
  margin-right: 10px;
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

.avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px; /* Adjust as needed */
  height: 50px; /* Adjust as needed */
  margin: 0 auto; /* Center the avatar container itself */
  border: 2px solid #8b6ef3;
  border-radius: 50%;
  overflow: hidden; /* Hides overflow, ensuring a circular crop */
  background-color: #000;
}

.avatar img {
  width: 200%; /* Scale image to fit the container */
  height: 100%;
  /* object-fit: cover;  */
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
  align-items: center; /* Vertically center the items */
  justify-content: flex-start; /* Align items to the start */
  padding: 10px 15px;
  margin-bottom: 10px;
  background-color: #cecae7;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-left: 12px;
  margin-right: 12px;
}

.regular-places .user-info {
  display: flex;
  flex-direction: column; /* Stack name and score vertically */
  text-align: left; /* Align text to the left */
}

#typed-output{
  width: 100%;
  margin: 10px;
  padding: 20px;
  font-size: 30px;
  display: inline;
}
</style>

<script setup>
import { ref, onMounted } from "vue";
import { createClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from "#app";
import CarouselSkeleton from "~/components/CarouselSkeleton.vue";
import Typed from 'typed.js';
// import { Chart, registerables } from "chart.js";
// import ChartDataLabels from 'chartjs-plugin-datalabels';

// Chart.register(ChartDataLabels);
// Chart.register(...registerables);

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
      return "280px"; // Highest for 1st place
    case 1:
      return "230px"; // Second highest for 2nd place
    case 2:
      return "200px"; // Lowest for 3rd place
    default:
      return "100px";
  }
}

async function fetchGames() {
  try {
    isLoading.value = true;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { data, error } = await supabase
      .from("games")
      .select("id, title, description, thumbnail_url");

    console.log(data);

    if (error) throw error;

    games.value = data;
    await Promise.all(games.value.map(fetchThumbnail));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  new Typed("#typed-output", {
    strings: [`Welcome to Elemental Heroes!`, "Hope you have fun!"],
    typeSpeed: 50,       // Typing speed in milliseconds
    backSpeed: 50,       // Backspacing speed in milliseconds
    showCursor: false,   // Hide the cursor
  });
});

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

// async function fetchLeaderboard() {
//   try {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('id, first_name, last_name, score')
//       .order('score', { ascending: false });

//     if (error) throw error;

//     leaderboard.value = await Promise.all(
//       data.map(async (profile) => {
//         const avatarPath = `avatars/${profile.first_name.toLowerCase()}_${profile.last_name.toLowerCase()}.png`;
//         const { data: avatarData, error: avatarError } = await supabase
//           .storage
//           .from('files_wad2')
//           .getPublicUrl(avatarPath);

//         if (avatarError) {
//           console.error('Error fetching avatar:', avatarError.message);
//           profile.avatar = '/assets/images/defaultAvatar.png'; // Fallback to a default image if there's an error
//         } else {
//           profile.avatar = avatarData.publicUrl || '/assets/images/defaultAvatar.png';
//         }
//         return profile;
//       })
//     );

//   } catch (error) {
//     console.error('Error fetching leaderboard:', error.message);
//   }
// }

async function fetchLeaderboard() {
  try {
    // Fetch profiles with the avatar URL path included
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, score, avatar_url") // Ensure avatar_url is included
      .order("score", { ascending: false });

    if (error) throw error;

    // Fetch public URLs for each avatar
    leaderboard.value = await Promise.all(
      data.map(async (profile) => {
        let avatarUrl;

        if (profile.avatar_url) {
          // Use the provided avatar URL path to fetch the public URL
          const { data: avatarData, error: avatarError } =
            await supabase.storage
              .from("files_wad2")
              .getPublicUrl(profile.avatar_url);

          // Assign the public URL or fallback to default if there's an error
          avatarUrl =
            avatarError || !avatarData.publicUrl
              ? "/assets/images/coolAvatar.png" // Local path for default avatar
              : avatarData.publicUrl;
        } else {
          // If no avatar URL is provided, use the default avatar
          avatarUrl = "/assets/images/coolAvatar.png";
        }

        return {
          ...profile,
          avatar: avatarUrl, // Assign avatar URL to each profile
        };
      })
    );
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
  }
}

function getCardClass(index) {
  if (index === 0) return "first-place";
  if (index === 1) return "second-place";
  if (index === 2) return "third-place";
  return "regular-place";
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
