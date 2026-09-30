export const BACKEND_URL = {
  LOCAL: {
    SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    WS_SERVER_URL: process.env.NEXT_PUBLIC_WS_SERVER_URL,
  },
  LIVE: {
    SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    WS_SERVER_URL: process.env.NEXT_PUBLIC_WS_SERVER_URL,
  },
};
