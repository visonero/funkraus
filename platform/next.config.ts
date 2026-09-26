import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // The microphone is only for our own pages (the AI tower); camera and location are never used.
          { key: "Permissions-Policy", value: "microphone=(self), camera=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // /kurs was a public, indexed page (pricing + curriculum detail) that's been folded into the
      // homepage's own pricing section. Redirect rather than 404 for anyone with the old URL bookmarked
      // or indexed.
      { source: "/kurs", destination: "/#preis", permanent: true },
    ];
  },
};

export default nextConfig;
