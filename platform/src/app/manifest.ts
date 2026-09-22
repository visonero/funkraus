import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "funkraus — BZF I & II Online-Kurs",
    short_name: "funkraus",
    description: "Online-Kurs zur Vorbereitung auf das Sprechfunkzeugnis BZF I & II.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f6f9fd",
    theme_color: "#2f9bea",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
