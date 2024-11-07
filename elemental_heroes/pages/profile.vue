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
        <span>MMR: {{ profile.score }}</span>
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
</template>

<script lang="js" setup>

import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#app';
import { ref, onMounted } from 'vue';

const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)
const profile = ref(null)
const avatar_url = ref(null)
const background_url = ref(null)
const isUploadingAvatar = ref(null)
const isUploadingBackground = ref(null)

const fileInput = ref(null);
const backgroundInput = ref(null);

// State for editing name
const isEditing = ref(false);
const editableFirstName = ref("");
const editableLastName = ref("");
const editableBio = ref("");

async function getProfile() {
  const { data, error } = await supabase.from("profiles").select().eq("id", 1).single();
  if (error) {
    console.error('Error fetching profile:', error.message);
  } else {
    profile.value = data;
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
    .from("profiles")
    .update({ first_name: firstName, last_name: lastName, bio: bio })
    .eq("id", 1);

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
  const { data } = await supabase.storage.from("files_wad2").getPublicUrl(profile.value.avatar_url);
  if (data) {
    avatar_url.value = data.publicUrl;
  }
}

async function getBackground() {
  const { data } = await supabase.storage.from("files_wad2").getPublicUrl(profile.value.background_url);
  if (data) {
    background_url.value = data.publicUrl;
  }
}

// Function to open file selection dialog
function triggerFileInput() {
  fileInput.value && fileInput.value.click();
}

function triggerBackgroundInput() {
  backgroundInput.value && backgroundInput.value.click();
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

  // Show confirmation alert
  if (!confirm('Are you sure you want to update your profile picture?')) {
    return;
  }

  isUploadingAvatar.value = true;
  try {
    // Get file extension and create filename
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${file.name}.${fileExt}`; // Keep the same filename to replace existing

    // Upload new file with upsert option
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files_wad2')
      .upload(`avatars/${fileName}`, file, {
        upsert: true, // This will replace the existing file
      });

    if (uploadError) throw uploadError;

    // Update profile with new avatar_url
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: `avatars/${fileName}` })
      .eq('id', 1);

    if (updateError) throw updateError;

    // Fetch the new avatar URL directly from Supabase storage
    const { data } = await supabase.storage
      .from('files_wad2')
      .getPublicUrl(`avatars/${fileName}`);
    if (data) {
      avatar_url.value = data.publicUrl; // Immediately update the displayed avatar
    }
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

  isUploadingBackground.value = true;
  try {
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${file.name}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('files_wad2')
      .upload(`background_images/${fileName}`, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ background_url: `background_images/${fileName}` })
      .eq('id', 1);
    if (updateError) throw updateError;

    const { data } = await supabase.storage
      .from('files_wad2')
      .getPublicUrl(`background_images/${fileName}`);
    if (data) {
      background_url.value = data.publicUrl;
    }
  } catch (error) {
    console.error('Error updating background:', error.message);
    alert('Failed to update background picture. Please try again.');
  } finally {
    isUploadingBackground.value = false;
  }
}


onMounted(() => {
  getProfile()
})
</script>

<style>
.background-img {
  width: 100%;
  max-height: 50vh; /* Adjust height based on viewport */
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.background-img img {
  width: 100%;
  height: auto; /* Ensures aspect ratio is maintained */
}

.profile {
  position: relative;
  top: -10vh; /* Adjust negative margin for smaller screens */
  margin: 0 auto;
  width: 90%; /* Adjusted to scale on smaller screens */
  max-width: 800px; /* Constrain max width for readability */
  background: white;
  padding: 20px; /* Reduced padding for better scaling */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  height: 30vw; /* Maintain a square aspect ratio to create a circle */
  max-width: 150px; /* Set a maximum size */
  max-height: 150px;
  border: 2px solid #8b6ef3;
  border-radius: 50%; /* Makes the container circular */
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
  object-fit: cover; /* Ensures the image fills the circle without distortion */
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
  bottom: 5px; /* Positions icon at the bottom */
  left: 50%; /* Centers the icon horizontally */
  transform: translateX(-50%); /* Adjusts position to truly center it */
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
  stroke: #8b6ef3; /* Optional: color change on hover */
}

.edit-name-icon {
  cursor: pointer; /* Change cursor to pointer */
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

.background-img {
  position: relative;
  width: 100%;
  max-height: 600px;
  overflow: hidden;
}

.background-img img {
  width: 100%;
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
}

.edit-background-icon:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.file-input {
  display: none;
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
