// @ts-check
import { defineConfig } from "astro/config";

// Vercel sets VERCEL_PROJECT_PRODUCTION_URL at build time (your production
// domain, custom domain if one is attached). Used for absolute Open Graph URLs.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export default defineConfig({
  site: vercelUrl ? `https://${vercelUrl}` : "http://localhost:4321",
  build: { format: "directory" },
});
