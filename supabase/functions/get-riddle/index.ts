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

    const { userId } = await req.json();

    // Check if user already has a riddle for today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingRiddle } = await supabase
      .from('user_riddles')
      .select('*, riddles(*)')
      .eq('user_id', userId)
      .eq('assigned_date', today)
      .single();

    if (existingRiddle) {
      const fact = existingRiddle.is_correct && existingRiddle.answered_at ? 
        (await supabase.from('facts').select('*').eq('active', true).limit(1).single()).data : null;
      
      return new Response(JSON.stringify({
        riddle: existingRiddle.riddles,
        answered: !!existingRiddle.answered_at,
        isCorrect: existingRiddle.is_correct,
        fact
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Assign a new riddle
    const { data: riddle } = await supabase
      .from('riddles')
      .select('*')
      .eq('active', true)
      .limit(1)
      .single();

    if (riddle) {
      await supabase.from('user_riddles').insert({
        user_id: userId,
        riddle_id: riddle.id,
        assigned_date: today
      });
    }

    return new Response(JSON.stringify({ riddle, answered: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
