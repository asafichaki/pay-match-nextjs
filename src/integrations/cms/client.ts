import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_CMS_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_CMS_SUPABASE_ANON_KEY!;

export const cmsClient = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const SITE_ID = process.env.NEXT_PUBLIC_CMS_SITE_ID!;
