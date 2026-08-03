import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourceHtml = await readFile(resolve(root, "index.html"), "utf8");
const styles = await readFile(resolve(root, "styles.css"), "utf8");
const script = await readFile(resolve(root, "script.js"), "utf8");

const files = {
  "/outputs/tiphub-favicon.svg": ["image/svg+xml", "outputs/tiphub-favicon.svg"],
  "/outputs/tiphub-logo-primary.svg": [
    "image/svg+xml",
    "outputs/tiphub-logo-primary.svg",
  ],
  "/prototype-assets/tiphub-prototype-desktop.png": [
    "image/png",
    "prototype-assets/tiphub-prototype-desktop.png",
  ],
  "/prototype-assets/tiphub-prototype-mobile.png": [
    "image/png",
    "prototype-assets/tiphub-prototype-mobile.png",
  ],
};

async function dataUri(mime, path) {
  const bytes = await readFile(resolve(root, path));
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

let bundled = sourceHtml
  .replace('<link rel="stylesheet" href="/styles.css" />', `<style>${styles}</style>`)
  .replace('<script src="/script.js"></script>', `<script>${script}</script>`);

for (const [url, [mime, path]] of Object.entries(files)) {
  bundled = bundled.replaceAll(url, await dataUri(mime, path));
}

const outputDirectory = resolve(root, "prototype-share");
await mkdir(outputDirectory, { recursive: true });
await writeFile(resolve(outputDirectory, "index.html"), bundled);

console.log(`Built ${resolve(outputDirectory, "index.html")}`);
