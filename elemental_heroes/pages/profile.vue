<template>
  <div class="background-img">
    <img :src="background_url" alt="" />
    <div class="edit-background-icon" @click="triggerBackgroundInput">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    </div>
    <input
      type="file"
      accept="image/*"
      @change="updateBackgroundImage"
      ref="backgroundInput"
      class="file-input"
    />
  </div>

  <div class="content">
    <div class="profile" v-if="profile">
      <div class="profile-left">
        <div class="avatar-section">
          <div class="avatar">
            <img :src="avatar_url" alt="" />
            <div class="edit-icon" @click="triggerFileInput">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 20h9" />
                <path
                  d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
                />
              </svg>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            @change="updateAvatar"
            ref="fileInput"
            class="file-input"
          />
        </div>
      </div>

      <div class="profile-right">
        <div class="name">
          <template v-if="isEditing">
            <input
              v-model="editableFirstName"
              class="name-input"
              placeholder="First Name"
            />
            <input
              v-model="editableLastName"
              class="name-input"
              placeholder="Last Name"
            />
          </template>
          <template v-else>
            <h1>{{ profile.first_name }} {{ profile.last_name }}</h1>
          </template>
        </div>

        <div class="stats">
          <span>{{ profile.games_played }} games</span>
          <span>•</span>
          <span>Score: {{ profile.score }}</span>
          <span>•</span>
          <span v-if="userRank">Rank: #{{ userRank }}</span>
        </div>

        <div class="bio">
          <template v-if="isEditing">
            <textarea
              v-model="editableBio"
              class="bio-input"
              placeholder="Your bio"
            ></textarea>
          </template>
          <template v-else>
            <p>{{ profile.bio }}</p>
          </template>
        </div>
      </div>

      <div class="action-buttons">
        <button v-if="!isEditing" @click="startEdit" class="edit-profile-btn">
          Edit Profile
        </button>
        <div v-if="isEditing" class="edit-actions">
          <button @click="saveChanges" class="save-btn">Save</button>
          <button @click="cancelEdit" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="game-skeleton">
      <CarouselSkeleton />
    </div>
    <div v-else class="games-container">
      <h3 class="game-title">Recently Played Games</h3>
      <div
        v-for="(game, index) in games"
        :key="game.id"
        class="card text-center mb-4"
      >
        <img :src="game.publicUrl" alt="Game thumbnail" class="card-img-top" />
        <div class="card-body">
          <h5 class="card-title">{{ game.title }}</h5>
          <p
            class="card-text"
            :class="{ 'truncate-text': !game.showFullDescription }"
          >
            {{ game.description }}
          </p>
          <button @click="toggleDescription(index)" class="btn btn-link">
            {{ game.showFullDescription ? "Show Less" : "Show More" }}
          </button>
          <p class="text-muted mt-2" v-if="uploadStatus">{{ uploadStatus }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js" setup>

import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#app';
import { ref, onMounted } from 'vue';
import CarouselSkeleton from "~/components/CarouselSkeleton.vue";

import profilePlaceholder from '@/assets/images/profile_placeholder.png';
import backgroundPlaceholder from '@/assets/images/background_placeholder.png';

const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)
const profile = ref(null)
const avatar_url = ref(profilePlaceholder); // Default to placeholder
const background_url = ref(backgroundPlaceholder); // Default to placeholder
const isUploadingAvatar = ref(null)
const isUploadingBackground = ref(null)
const isLoading = ref(true);
const games = ref([])

//use this to retrieve user
const user = useSupabaseUser()
const id = user.value.id

const fileInput = ref(null);
const backgroundInput = ref(null);

// State for editing name
const isEditing = ref(false);
const editableFirstName = ref("");
const editableLastName = ref("");
const editableBio = ref("");
const userRank = ref(null);  // Reactive variable to store the user's rank

async function fetchLeaderboardAndUserRank(userId) {
  try {
    const { data, error } = await supabase
      .from("profiles2")
      .select("id, first_name, last_name, score")
      .order("score", { ascending: false });

    if (error) throw error;

    const rank = data.findIndex(profile => profile.id === userId) + 1;
    userRank.value = rank;

    return data;
  } catch (error) {
    console.error("Error fetching leaderboard and user rank:", error.message);
  }
}


async function getProfile() {
  const { data, error } = await supabase.from("profiles2").select().eq("id", user.value.id).single();
  if (error) {
    console.error('Error fetching profile:', error.message);
  } else {
    profile.value = data;

    // Set profile and background images from database, with fallback to placeholders
    avatar_url.value = data.avatar_url
      ? await supabase.storage.from("files_wad2").getPublicUrl(data.avatar_url).data.publicUrl
      : profilePlaceholder;

    background_url.value = data.background_url
      ? await supabase.storage.from("files_wad2").getPublicUrl(data.background_url).data.publicUrl
      : backgroundPlaceholder;
  }
}

//use this for auth enabled app
async function getProfile2() {
  const { data, error } = await supabase.from("profiles2").select().eq("id", id).single();
  if (error) {
    console.error('Error fetching profile:', error.message);
  } else {
    profile.value = data;
    console.log(id)

    getBackground();
    getAvatar();

  }
}


// Start editing both name and bio
function startEdit() {
  isEditing.value = true;
  editableFirstName.value = profile.value.first_name;
  editableLastName.value = profile.value.last_name;
  editableBio.value = profile.value.bio;
}

// Cancel editing
function cancelEdit() {
  isEditing.value = false;
}

// Save changes to both name and bio
async function saveChanges() {
  const firstName = editableFirstName.value;
  const lastName = editableLastName.value;
  const bio = editableBio.value;

  const { error } = await supabase
    .from("profiles2")
    .update({ first_name: firstName, last_name: lastName, bio: bio })
    .eq("id", user.value.id);

  if (!error) {
    profile.value.first_name = firstName;
    profile.value.last_name = lastName;
    profile.value.bio = bio;
    isEditing.value = false;
  } else {
    console.error("Failed to update profile:", error.message);
    alert("Failed to update profile. Please try again.");
  }
}

async function getAvatar() {
  // Check if the profile has an avatar URL
  if (!profile.value.avatar_url) {
    avatar_url.value = profilePlaceholder; // Set to placeholder if not set
    return;
  }
  
  // Fetch the avatar image URL from Supabase if it exists
  const { data } = await supabase.storage.from("files_wad2").getPublicUrl(profile.value.avatar_url);
  if (data && data.publicUrl) {
    avatar_url.value = data.publicUrl;
  } else {
    avatar_url.value = profilePlaceholder; // Use placeholder on error or null
  }
}

async function getBackground() {
  // Check if the profile has a background URL
  if (!profile.value.background_url) {
    background_url.value = backgroundPlaceholder; // Set to placeholder if not set
    return;
  }

  // Fetch the background image URL from Supabase if it exists
  const { data } = await supabase.storage.from("files_wad2").getPublicUrl(profile.value.background_url);
  if (data && data.publicUrl) {
    background_url.value = data.publicUrl;
  } else {
    background_url.value = backgroundPlaceholder; // Use placeholder on error or null
  }
}

// Function to open file selection dialog
function triggerFileInput() {
  fileInput.value && fileInput.value.click();
}

function triggerBackgroundInput() {
  backgroundInput.value && backgroundInput.value.click();
  console.log("hi")
}

async function updateFirstName(firstName) {
  //hardcoded to id=1 for now
  const { data, error } = await supabase.from("profiles").update({ first_name: firstName }).eq("id", 1);

  if (data) {
    console.log(data)

  } else {
    console.log(error)
  }
}

async function updateLastName(lastName) {
  //hardcoded to id=1 for now
  const { data, error } = await supabase.from("profiles").update({ last_name: lastName }).eq("id", 1);

  if (data) {
    console.log(data)

  } else {
    console.log(error)
  }
}

async function updateBio(bio) {
  //hardcoded to id=1 for now
  const { data, error } = await supabase.from("profiles").update({ bio: bio }).eq("id", 1);

  if (data) {
    console.log(data)

  } else {
    console.log(error)
  }
}


async function updateAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!confirm('Are you sure you want to update your profile picture?')) return;

  isUploadingAvatar.value = true;
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `avatars/${user.value.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('files_wad2').upload(fileName, file, { upsert: true });
    if (uploadError) throw uploadError;

    // Update avatar URL in the profiles2 table
    const { error: updateError } = await supabase.from('profiles2').update({ avatar_url: fileName }).eq('id', user.value.id);
    if (updateError) throw updateError;

    const { data } = await supabase.storage.from('files_wad2').getPublicUrl(fileName);
    avatar_url.value = data.publicUrl;
  } catch (error) {
    console.error('Error updating avatar:', error.message);
    alert('Failed to update profile picture. Please try again.');
  } finally {
    isUploadingAvatar.value = false;
  }
}

async function updateBackgroundImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!confirm('Are you sure you want to update your background image?')) return;

  isUploadingBackground.value = true;
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `background_images/${user.value.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('files_wad2').upload(fileName, file, { upsert: true });
    if (uploadError) throw uploadError;

    // Update background URL in the profiles2 table
    const { error: updateError } = await supabase.from('profiles2').update({ background_url: fileName }).eq('id', user.value.id);
    if (updateError) throw updateError;

    const { data } = await supabase.storage.from('files_wad2').getPublicUrl(fileName);
    background_url.value = data.publicUrl;
  } catch (error) {
    console.error('Error updating background:', error.message);
    alert('Failed to update background image. Please try again.');
  } finally {
    isUploadingBackground.value = false;
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
    games.value = data.map(game => ({
      ...game,
      showFullDescription: false
    }));

    games.value = data;
    await Promise.all(games.value.map(fetchThumbnail));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    isLoading.value = false;
  }
}

function toggleDescription(index) {
  if (games.value[index]) {
    games.value[index].showFullDescription = !games.value[index].showFullDescription;
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

onMounted(async () => {
  await getProfile();
  await fetchGames();
  await fetchLeaderboardAndUserRank(user.value.id);
});
</script>

<style>
.background-img {
  width: 100%;
  max-height: 50vh;
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.background-img img {
  width: 100%;
  height: auto;
}

/* .profile {
  position: relative;
  top: -30vh; 
  margin: 0 auto;
  width: 90%; 
  max-width: 800px;
  background: white;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
} */

.profile {
  position: relative;
  top: -10vh; /* Adjust to control profile overlap */
  margin: 0 auto;
  width: 90%;
  max-width: 800px;
  background: white;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  z-index: 2; /* Ensure profile card is above games */
}

.profile-left {
  flex-shrink: 0;
}

.profile-right {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 0;
}

.profile-left,
.profile-right {
  width: 100%;
}

.edit-profile-btn,
.save-btn,
.cancel-btn {
  background-color: #8b6ef3;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 0 auto;
  width: fit-content;
}

.edit-profile-btn:hover,
.save-btn:hover,
.cancel-btn:hover {
  background-color: #b2a9ec;
}

.edit-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.avatar {
  width: 30vw;
  height: 30vw;
  max-width: 150px;
  max-height: 150px;
  border: 2px solid #8b6ef3;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  position: relative;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.name-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-input {
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.save-btn {
  background-color: #4caf50;
  color: white;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
}

.name-input,
.bio-input {
  width: 100%;
  font-size: 18px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.bio-input {
  min-height: 80px;
  resize: vertical;
}

.name h1 {
  font-size: calc(1.5em + 1vw); /* Responsive font size */
  font-weight: 600;
  text-align: center;
}

.stats {
  color: #666;
  font-size: 0.9em;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.bio {
  font-size: 1em;
  line-height: 1.5;
  color: #333;
  text-align: center;
}

.name h1,
.bio,
.stats,
.action-buttons {
  text-align: center;
}

.score {
  font-size: 16px;
  color: #333;
}

.avatar-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.file-input {
  display: none;
}

.edit-icon {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-icon:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.edit-name-icon:hover svg {
  stroke: #8b6ef3;
}

.edit-name-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.file-input::-webkit-file-upload-button {
  background-color: #8b6ef3;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.file-input::-webkit-file-upload-button:hover {
  background-color: #b2a9ec;
}

/* .background-img {
  position: relative;
  width: 100%;
  max-height: 600px;
  overflow: hidden;
}

.background-img img {
  width: 100%;
} */

.background-img {
  width: 100%;
  max-height: 50vh;
  position: relative;
  overflow: hidden;
}

.background-img img {
  width: 100%;
  height: auto;
}

.edit-background-icon {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.edit-background-icon:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.file-input {
  display: none;
}

.stats span:not(:nth-child(2)) {
  cursor: pointer;
}

.stats span:not(:nth-child(2)):hover {
  color: #8b6ef3;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.message-btn {
  background-color: #8b6ef3;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-btn:hover {
  background-color: #b2a9ec;
}

.friend-btn {
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.friend-btn:hover {
  background-color: #e0e0e0;
}

.friend-btn svg {
  width: 20px;
  height: 20px;
}

/* Optional: Add active states for the buttons */
.message-btn:active {
  transform: scale(0.98);
}

.friend-btn:active {
  transform: scale(0.95);
}

.content {
  position: relative;
  margin-top: -20vh; /* Adjust this to control overlap */
  padding-top: 20vh; /* Keeps space above profile for overlap */
}

.games-container,
.game-skeleton {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  padding: 20px;
  margin-top: 0vh; /* Adjust to control games overlap */
  z-index: 1;
}
.card {
  width: 250px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-img-top {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.card-body {
  padding: 15px;
}

.card-title {
  font-size: 1.2em;
  font-weight: bold;
}

.card-text {
  font-size: 0.9em;
  color: #555;
}

.text-muted {
  font-size: 0.8em;
  color: #777;
}

.truncate-text {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limits the text to 2 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-title {
  text-align: center;
  width: 100%;
  font-weight: bold;
}

@media (max-width: 768px) {
  .profile {
    padding: 10px;
    width: 95%;
  }

  .name h1 {
    font-size: 1.5em; /* Reduced font size on smaller screens */
  }

  .bio,
  .stats {
    font-size: 0.9em;
  }

  .edit-profile-btn,
  .save-btn,
  .cancel-btn {
    padding: 4px 8px;
    font-size: 0.9em;
  }
}
</style>
