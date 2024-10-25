<template>
  <div class="game">gamelists</div>

  <form @submit.prevent="handleSubmit">
    <div>
      <label for="score">Score:</label>
      <input type="number" id="score" v-model="score" />
    </div>
    <div>
      <label for="id">ID:</label>
      <input type="number" id="id" v-model="id" />
    </div>
    <button type="submit">Update Score</button>
  </form>
</template>

<script lang="js" setup>
import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#app';
const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)




async function updateScores() {
  const { error } = await supabase
    .from('profiles')
    .update({ score: score.value })
    .eq('id', id.value);

  if (error) {
    console.error('Error updating score:', error.message);
  } else {
    console.log('Score updated successfully');
  }
}

function handleSubmit() {
  updateScores();
}
</script>

<style></style>
