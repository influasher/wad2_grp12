import { createClient } from '@supabase/supabase-js';
import { useRuntimeConfig } from '#app';

const config = useRuntimeConfig();
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey);

export async function updateScores(additionalScore, userId = 1) {
  // Fetch the current score
  const { data, error: fetchError } = await supabase
    .from('profiles')
    .select('score')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching current score:', fetchError.message);
    return false; // Exit if there was an error fetching the current score
  }

  const currentScore = data ? data.score : 0; // Fallback to 0 if score is undefined
  const newScore = currentScore + additionalScore; // Calculate the updated score

  // Update the score in the database
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ score: newScore })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating score:', updateError.message);
    return false; // Return false if there was an error updating the score
  }

  return true; // Return true if the update was successful
}
