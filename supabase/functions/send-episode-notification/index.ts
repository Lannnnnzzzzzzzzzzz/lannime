import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { anime_id, anime_title, episode_number } = await req.json();

    if (!anime_id || !anime_title || !episode_number) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: subscriptions } = await supabase
      .from('anime_subscriptions')
      .select('user_id, notify_app, notify_email, user_profiles(username, id)')
      .eq('anime_id', anime_id);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subscriptions found' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const notifications = [];

    for (const sub of subscriptions) {
      if (sub.notify_app) {
        notifications.push({
          user_id: sub.user_id,
          type: 'new_episode',
          title: 'New Episode Available!',
          message: `Episode ${episode_number} of ${anime_title} is now available.`,
          anime_id: anime_id,
          episode_number: episode_number,
        });
      }

      if (sub.notify_email) {
        const { data: prefs } = await supabase
          .from('user_preferences')
          .select('email_notifications')
          .eq('user_id', sub.user_id)
          .single();

        if (prefs?.email_notifications) {
          console.log(`Would send email to user ${sub.user_id} about ${anime_title} ep ${episode_number}`);
        }
      }
    }

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }

    return new Response(
      JSON.stringify({
        success: true,
        notified: notifications.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});