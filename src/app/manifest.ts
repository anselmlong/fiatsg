import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fiat — give what you have",
    short_name: "Fiat",
    description: "Offer your time, skills and prayer to Catholic organisations in Singapore.",
    start_url: "/",
    display: "standalone",
    background_color: "#fef6ed",
    theme_color: "#4e2984",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
