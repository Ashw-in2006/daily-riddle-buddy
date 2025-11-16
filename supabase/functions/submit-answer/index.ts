import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { userId, riddleId, answer } = await req.json();
    const today = new Date().toISOString().split('T')[0];

    const { data: riddle } = await supabase
      .from('riddles')
      .select('answer')
      .eq('id', riddleId)
      .single();

    const isCorrect = riddle?.answer.toLowerCase().trim() === answer.toLowerCase().trim();

    await supabase
      .from('user_riddles')
      .update({
        answered_at: new Date().toISOString(),
        is_correct: isCorrect
      })
      .eq('user_id', userId)
      .eq('assigned_date', today);

    if (isCorrect) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, total_correct')
        .eq('id', userId)
        .single();

      const newStreak = (profile?.current_streak || 0) + 1;
      const longestStreak = Math.max(newStreak, profile?.longest_streak || 0);

      await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          total_correct: (profile?.total_correct || 0) + 1,
          last_answered_date: today
        })
        .eq('id', userId);

      const { data: fact } = await supabase
        .from('facts')
        .select('*')
        .eq('active', true)
        .limit(1)
        .single();

      return new Response(JSON.stringify({ isCorrect, fact }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ isCorrect }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
