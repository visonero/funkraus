import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
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
