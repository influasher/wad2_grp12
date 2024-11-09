import { createClient } from '@supabase/supabase-js';
import { useRuntimeConfig } from '#app';

const config = useRuntimeConfig();
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey);
const user = useSupabaseUser()


export async function updateScores(additionalScore) {

  const user = useSupabaseUser()
  console.log("🚀 ~ updateScores ~ useSupabaseUser:", user)

  try {

    const id = user.value.id;

    // Fetch the current score from profiles2
    const { data, error: fetchError } = await supabase
      .from('profiles2')
      .select('score')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching current score:', fetchError.message);
      return false;
    }

    const currentScore = data ? data.score : 0;
    const newScore = currentScore + additionalScore;

    // Update the score in the profiles2 table
    const { error: updateError } = await supabase
      .from('profiles2')
      .update({ score: newScore })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating score:', updateError.message);
      return false;
    }

    return true; // Successfully updated
  } catch (error) {
    console.error('Error in updateScores:', error.message);
    return false;
  }
}
