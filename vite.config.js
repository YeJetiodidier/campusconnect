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
        sell: resolve(__dirname, "sell.html"),
        offerService: resolve(__dirname, "offer-service.html"),
        productDetails: resolve(__dirname, "product-details.html"),
        serviceDetails: resolve(__dirname, "service-details.html"),
        services: resolve(__dirname, "services.html"),
        messages: resolve(__dirname, "messages.html"),
        chats: resolve(__dirname, "chats.html"),
        profile: resolve(__dirname, "profile.html"),
        settings: resolve(__dirname, "settings.html"),
        login: resolve(__dirname, "login.html"),
        register: resolve(__dirname, "register.html"),
        forgotPassword: resolve(__dirname, "forgot-password.html"),
        postOpportunity: resolve(__dirname, "post-opportunity.html"),
        announcements: resolve(__dirname, "announcements.html"),
        referrals: resolve(__dirname, "referrals.html"),
        paymentgateway: resolve(__dirname, "paymentgateway.html"),
        notFound: resolve(__dirname, "404.html"),
        googleVerification: resolve(__dirname, "google502602e78988b2c0.html"),
      },
    },
  },
});
