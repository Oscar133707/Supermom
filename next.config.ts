import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep recently visited pages in the client router cache for 30 s so switching
    // tabs back and forth is instant. Every server action calls revalidatePath(),
    // which clears this cache, so logged data never shows stale.
    staleTimes: { dynamic: 30, static: 300 },
  },
};

export default nextConfig;
