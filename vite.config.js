// vite.config.js
// Multi-page app config: every top-level .html file is its own entry
// point, so `npm run dev` serves them all and `npm run build` bundles
// each one (plus its imported JS/CSS/images) for production.

import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
        internships: resolve(__dirname, "internships.html"),
        jobDetails: resolve(__dirname, "job-details.html"),
        events: resolve(__dirname, "events.html"),
        eventDetails: resolve(__dirname, "event-details.html"),
        notifications: resolve(__dirname, "notifications.html"),
        favorites: resolve(__dirname, "favorites.html"),
        marketplace: resolve(__dirname, "marketplace.html"),
        messages: resolve(__dirname, "messages.html"),
        profile: resolve(__dirname, "profile.html"),
      },
    },
  },
});
