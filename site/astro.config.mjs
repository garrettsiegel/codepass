import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// keepitmovin.dev is live; `site` makes canonical URLs, og:image, and the
// sitemap resolve to absolute URLs. No `base` — the site deploys at the root.
export default defineConfig({
  site: "https://www.keepitmovin.dev",
  output: "static",
  integrations: [sitemap()]
});
