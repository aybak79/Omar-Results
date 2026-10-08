import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = import.meta.dirname;

// The live address. Canonicals, og:url, the sitemap and robots.txt all read it,
// so moving to a custom domain is a one-line change. Write {{site}} in HTML to use it.
const SITE_URL = "https://omar-results.vercel.app";

// Every page that should end up on the site. Add new pages here.
// path is the public URL (no trailing slash, see vercel.json).
// index: true lists the page in sitemap.xml. Keep it false for noindex pages.
const pages = {
  home: { file: "index.html", path: "/", index: true },
  twoBusinessOwners: { file: "two-business-owners/index.html", path: "/two-business-owners", index: false },
  comingSoon: { file: "coming-soon/index.html", path: "/coming-soon", index: false },
  hardestWorkingEgypt: {
    file: "hardest-working-strategic-marketer-in-egypt/index.html",
    path: "/hardest-working-strategic-marketer-in-egypt",
    index: true,
  },
};

// <include src="partials/x.html" key="value">content</include>
// Inlines the partial, replacing {{key}} with attribute values and
// {{content}} with whatever sits between the tags. {{key|fallback}} uses
// the fallback when the attribute is missing.
const INCLUDE = /<include\s+src="([^"]+)"([^>]*)>([\s\S]*?)<\/include>/g;
const VAR = /\{\{\s*([\w-]+)\s*(?:\|\s*([^}]*?)\s*)?\}\}/g;

function renderIncludes(html) {
  return html.replace(INCLUDE, (_, src, attrs, content) => {
    const vars = { site: SITE_URL, content: content.trim() };
    for (const [, key, value] of attrs.matchAll(/([\w-]+)="([^"]*)"/g)) vars[key] = value;
    const partial = renderIncludes(readFileSync(resolve(root, src), "utf8"));
    return partial.replace(VAR, (_, key, fallback) => vars[key] ?? fallback ?? "").trim();
  });
}

function renderPage(html) {
  return renderIncludes(html).replace(/\{\{\s*site\s*\}\}/g, SITE_URL);
}

function htmlIncludes() {
  return {
    name: "html-includes",
    transformIndexHtml: { order: "pre", handler: renderPage },
    configureServer(server) {
      // Partials aren't imported by anything, so reload the page when one changes.
      const partialsDir = resolve(root, "partials");
      server.watcher.add(partialsDir);
      server.watcher.on("change", (file) => {
        if (resolve(file).startsWith(partialsDir)) server.ws.send({ type: "full-reload" });
      });
    },
  };
}

// Vercel serves /page from page/index.html. The local dev and preview servers
// only do that for /page/, so rewrite the slash-less URL to match.
function cleanPaths() {
  const paths = new Set(Object.values(pages).map((page) => page.path).filter((path) => path !== "/"));
  const rewrite = (req, _res, next) => {
    const [path, query] = req.url.split(/(?=\?)/);
    if (paths.has(path)) req.url = `${path}/${query ?? ""}`;
    next();
  };
  return {
    name: "clean-paths",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

// Writes sitemap.xml (indexable pages only) and robots.txt into the build.
function seoFiles() {
  return {
    name: "seo-files",
    apply: "build",
    generateBundle() {
      const urls = Object.values(pages)
        .filter((page) => page.index)
        .map((page) => `  <url><loc>${SITE_URL}${page.path}</loc></url>`)
        .join("\n");
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [htmlIncludes(), cleanPaths(), seoFiles(), react()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(Object.entries(pages).map(([name, page]) => [name, resolve(root, page.file)])),
    },
  },
});
