<template>
  <div class="background-img">
    <img :src="background_url" alt="" />
  </div>

  <div class="profile" v-if="profile">
    <div class="profile-left">
      <div class="avatar">
        <img :src="avatar_url" alt="" />
      </div>
    </div>

    <div class="profile-right">
      <div class="name">
        <h1>{{ profile.first_name }} {{ profile.last_name }}</h1>
        <div class="stats">
          <span>{{ profile.games_played }} games</span>
          <span>•</span>
          <span>MMR: {{ profile.score }}</span>
        </div>
      </div>

      <div class="bio">
        <p>{{ profile.bio }}</p>
      </div>

    </div>
    <div class="action-buttons">
        <button class="message-btn">Message</button>
        <button class="friend-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </button>
      </div>
  </div>
</template>

<script lang="js" setup>

import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#app';
const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)
const profile = ref(null)
const avatar_url = ref(null)
const background_url = ref(null)

async function getProfile() {
  //get profile, hardcoded to id=1 for now
  const { data, error } = await supabase.from("profiles").select().eq("id", 1).single();
  // console.log(data)
  if (error) {
    console.error('Error fetching profile:', error.message);
  } else {
    profile.value = data;
    // console.log(profile.value);
  }

}

async function getAvatar() {
  const { data, error } = await supabase
  .storage.from("files_wad2").getPublicUrl("avatars/john_doe.png")
  if (data) {
    // console.log(data)
    avatar_url.value = data.publicUrl
    // console.log(img_url.value)
  }
  }

async function getBackground() {
  const { data, error } = await supabase
  .storage.from("files_wad2").getPublicUrl("background_images/john_doe_background.jpg")
  if (data) {
    console.log(data)
    background_url.value = data.publicUrl
    console.log(background_url.value)
  }
  }

onMounted(() => {
  getProfile()
  getAvatar()
  getBackground()
})
</script>

<style>
.background-img {
  width: 100%;
  max-height: 600px;
  display: inline-block;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
  }
}

.profile {
  position: relative;
  top: -180px;
  margin: 0 auto;
  width: 80%;
  background: white;
  padding: 40px 40px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  gap: 40px;
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

.avatar {
  width: 200px;
  height: 200px;
  overflow: hidden;
  border: 2px solid #8b6ef3;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar img {
  width: 130%;
  height: 130%;
}

.name {
  margin-bottom: 8px;
}

.name h1 {
  font-size: 32px;
  font-weight: 600;
  margin: 0;
  margin-bottom: 8px;
}

.stats {
  color: #666;
  font-size: 16px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.bio {
  font-size: 16px;
  line-height: 1.5;
  color: #333;
}

.score {
  font-size: 16px;
  color: #333;
}

/* Optional: Add hover effect on stats */
.stats span:not(:nth-child(2)) {
  cursor: pointer;
}

.stats span:not(:nth-child(2)):hover {
  color: #8b6ef3;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-right: 20px;
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
  background-color: #B2A9EC;
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
</style>
