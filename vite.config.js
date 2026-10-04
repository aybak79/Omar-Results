import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = import.meta.dirname;

// Every page that should end up on the site. Add new pages here.
const pages = {
  home: "index.html",
  twoBusinessOwners: "two-business-owners/index.html",
};

// <include src="partials/x.html" key="value">content</include>
// Inlines the partial, replacing {{key}} with attribute values and
// {{content}} with whatever sits between the tags.
const INCLUDE = /<include\s+src="([^"]+)"([^>]*)>([\s\S]*?)<\/include>/g;

function renderIncludes(html) {
  return html.replace(INCLUDE, (_, src, attrs, content) => {
    const vars = { content: content.trim() };
    for (const [, key, value] of attrs.matchAll(/([\w-]+)="([^"]*)"/g)) vars[key] = value;
    const partial = renderIncludes(readFileSync(resolve(root, src), "utf8"));
    return partial.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_, key) => vars[key] ?? "").trim();
  });
}

function htmlIncludes() {
  return {
    name: "html-includes",
    transformIndexHtml: { order: "pre", handler: renderIncludes },
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

export default defineConfig({
  plugins: [htmlIncludes(), react()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(Object.entries(pages).map(([name, file]) => [name, resolve(root, file)])),
    },
  },
});
