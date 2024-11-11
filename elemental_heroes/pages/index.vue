<!-- pages/index.vue -->
<template>
  <div class="home-page">

    <div class="p-3 my-2 text-center typewriter">
      <h2 id="typed-output" class="press-start-2p-regular"></h2> 
    </div>
  
    

      <div v-if="isLoading" class="skeleton-container">
        <CarouselSkeleton />
      </div>

      <div
        v-else
        id="carouselExampleAutoplaying"
        class="carousel slide carousel_slide"
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

    <div class="leaderboard">
    <div v-if="isLoading" class="leaderboard-skeleton">
      <CarouselSkeleton />
    </div>

    <div v-else class="leaderboard-container">
      <h3 class="leaderboard-title press-start-2p-regular">Leaderboard</h3>
      <div v-if="leaderboard.length">
        <p v-if="currentUserRank" class="message">
          {{ getEncouragementMessage(currentUserRank, currentUserFirstName) }}
        </p>
      </div> 
      <div class="top-three press-start-2p-regular row">
        <div
          v-for="(profile, index) in leaderboard.slice(0, 3)"
          :key="profile.id"
          class="leaderboard-card top-card"
          :class="getCardClass(index)"
          :style="{ height: getBarHeight(index) }"
        >
          <div class="rank-number">{{ index + 1 }}</div>
          <div class="avatar">
            <img :src="profile.avatar || '/assets/images/coolAvatar.png'" class="img-fluid"/>
          </div>
          <div class="user-info">
            <div class="user-name">
              {{ profile.first_name }}
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

.carousel_slide{
  justify-content: center;
  padding: 10px;
  width: 100%;
}

.carousel-item img {
  width: 100%;
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.card {
  width: 100%;
  max-height: 70vh;
  display: inline-block;
  position: relative;
  overflow: hidden;
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
  max-width: 200px; 
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
  padding: 10px;
}

.leaderboard{
  padding: 10px;
  width: 100%;
}

.leaderboard-container {
  width: 100%;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 15px;
}

.leaderboard-skeleton {
  width: 100%;
  border-radius: 15px;
}

.leaderboard-title {
  text-align: center;
  padding-bottom: 20px;
  padding-top: 20px;
  margin: auto;
}

.message{
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}

.top-card {
  width: 30%;
  border-radius: 15px;
  padding: 10px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  word-wrap: break-word; /* Ensure long names wrap to the next line */
}

.top-three {
  display: flex;
  justify-content: space-evenly;
  align-items: flex-end;
  margin-bottom: 20px;
  gap: 10px;
  padding: 10px;
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
  border: 2px solid #8b6ef3;
  border-radius: 50%;
  overflow: hidden; /* Hides overflow, ensuring a circular crop */
  background-color: #000;
  margin: 0 auto;
}

.avatar img {
  width: 200%; /* Scale image to fit the container */
  height: 100%;
  /* object-fit: cover;  */
}

.user-name {
  font-weight: bold;
  margin-bottom: 5px;
  white-space: nowrap; /* Prevents text overflow */
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
}

.user-score {
  font-size: 14px;
  color: #666;
}

.regular-places .leaderboard-card {
  display: flex;
  align-items: center; /* Vertically center the items */
  justify-content: flex-start; 
  padding: 10px 15px;
  margin-bottom: 10px;
  background-color: #cecae7;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-left: 12px;
  margin-right: 12px;
  word-wrap: break-word; /* Ensure long names wrap to the next line */
}


.regular-places .user-info {
  display: flex;
  flex-direction: column; /* Stack name and score vertically */
  text-align: left; /* Align text to the left */
}

#typed-output{
  width: 100%;
  padding: 10px;
  font-size: 25px;
}
</style>

<script setup>
import { ref, onMounted } from "vue";
import { createClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from "#app";
import CarouselSkeleton from "~/components/CarouselSkeleton.vue";
import Typed from 'typed.js';

const user = useSupabaseUser();
const currentUserRank = ref(null);
const currentUserFirstName = ref("");
const config = useRuntimeConfig();
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseKey
);
const games = ref([]);
const isLoading = ref(true);
const leaderboard = ref([]);
const firstName = ref("");

async function getFirstName() {
  const { data, error } = await supabase.from("profiles2").select("first_name").eq("id", user.value.id).single();
  
  if (error) {
    console.error("Error fetching first name:", error.message);
  } else {
    firstName.value = data.first_name;
  }
}

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

onMounted(async () => {
  await getFirstName();

  new Typed("#typed-output", {
    strings: [`Welcome to Elemental Heroes, ${firstName.value}!`],
    typeSpeed: 50,
    backSpeed: 50,
    showCursor: false,
  });
});

async function fetchLeaderboard() {
  try {
    // Fetch profiles with the avatar URL path included
    const { data, error } = await supabase
      .from("profiles2")
      .select("id, first_name, score, avatar_url") // Ensure avatar_url is included
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
     // Find the current user’s rank
     const rank = leaderboard.value.findIndex(profile => profile.id === user.value.id);
    if (rank !== -1) {
      currentUserRank.value = rank + 1; // Convert to 1-based rank
      currentUserFirstName.value = leaderboard.value[rank].first_name;
    }
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
  }
}

function getEncouragementMessage(rank, firstName) {
  // Messages for the top 3 ranks
  const topMessages = {
    1: `You are ranked 1st, ${firstName}! Outstanding performance!`,
    2: `You are ranked 2nd, ${firstName}! Keep up the amazing work!`,
    3: `You are ranked 3rd, ${firstName}! Impressive dedication!`
  };

  // If the user is in the top 3, return the corresponding message
  if (rank <= 3) return topMessages[rank];

  // Messages for regular ranks (4th and below)
  const regularMessages = [
    `You're in ${rank}th place, ${firstName}! Keep pushing forward!`,
    `Ranked ${rank}th! Great effort, ${firstName}! Keep it going!`,
    `You're in ${rank}th place, ${firstName}! Every step counts!`,
    `Rank ${rank}, ${firstName}! Keep climbing the leaderboard!`,
    `You're at the ${rank}th spot, ${firstName}! Stay motivated!`,
    `${rank}th place, ${firstName}! You’re on the right track!`
  ];

  // Randomly select a message for regular ranks
  return regularMessages[Math.floor(Math.random() * regularMessages.length)];
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
