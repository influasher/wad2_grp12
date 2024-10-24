<template>
  <div v-if="profile">
    <h2>Profile Details</h2>
    <p><strong>Id:</strong> {{ profile.id }}</p>
    <p><strong>Email:</strong> {{ profile.email }}</p>
    <p><strong>First Name:</strong> {{ profile.first_name }}</p>
    <p><strong>Last Name:</strong> {{ profile.last_name }}</p>

    <p><strong>Score:</strong> {{ profile.score }}</p>
  </div>
</template>

<script lang="js" setup>

import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#app';
const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)
const profile = ref(null)

async function getProfile() {
  //get profile, hardcoded to id=1 for now
  const { data, error } = await supabase.from("profiles").select().eq("id", 1).single();
  // console.log(data)
  if (error) {
    console.error('Error fetching profile:', error.message);
  } else {
    profile.value = data;
    console.log(profile.value);
  }

}

onMounted(() => {
  getProfile()
})
</script>

<style></style>
