import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require(
  "/Users/prajaktagaikwad/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp",
);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { ArrowRight } = await import("@phosphor-icons/react/dist/ssr/ArrowRight");
const { ArrowUpRight } = await import("@phosphor-icons/react/dist/ssr/ArrowUpRight");
const { Plus } = await import("@phosphor-icons/react/dist/ssr/Plus");
const { Minus } = await import("@phosphor-icons/react/dist/ssr/Minus");
const { MagnifyingGlass } = await import("@phosphor-icons/react/dist/ssr/MagnifyingGlass");
const { List } = await import("@phosphor-icons/react/dist/ssr/List");
const { X } = await import("@phosphor-icons/react/dist/ssr/X");
const { LinkedinLogo } = await import("@phosphor-icons/react/dist/ssr/LinkedinLogo");

const root = process.cwd();
const out = path.join(root, "output", "brand-kit", "TipHub-Brand-Assets");
const logos = path.join(out, "01-Logos");
const favicons = path.join(out, "02-Favicon-App-Icons");
const imagery = path.join(out, "06-Photography-Imagery");
const iconography = path.join(out, "05-Iconography");

await Promise.all([
  fs.mkdir(logos, { recursive: true }),
  fs.mkdir(favicons, { recursive: true }),
  fs.mkdir(imagery, { recursive: true }),
  fs.mkdir(iconography, { recursive: true }),
]);

const primaryPath = path.join(root, "public", "brand", "tiphub-logo-primary.svg");
const symbolPath = path.join(root, "public", "brand", "tiphub-symbol.svg");
const faviconPath = path.join(root, "public", "favicon.svg");
const primarySvg = await fs.readFile(primaryPath, "utf8");
const symbolSvg = await fs.readFile(symbolPath, "utf8");
const faviconSvg = await fs.readFile(faviconPath, "utf8");

const recolor = (svg, color) =>
  svg.replace(/fill="#(?:F05A32|124A46|0D3734|D94725|121715)"/gi, `fill="${color}"`);

await fs.copyFile(primaryPath, path.join(logos, "TipHub-Logo-Primary-Full-Color.svg"));
await fs.copyFile(symbolPath, path.join(logos, "TipHub-Symbol-Full-Color.svg"));
await fs.writeFile(
  path.join(logos, "TipHub-Logo-Primary-Monochrome-Carbon.svg"),
  recolor(primarySvg, "#121715"),
);
await fs.writeFile(
  path.join(logos, "TipHub-Logo-Primary-Reversed-Chalk.svg"),
  recolor(primarySvg, "#F2EBDD"),
);
await fs.writeFile(
  path.join(logos, "TipHub-Symbol-Monochrome-Carbon.svg"),
  recolor(symbolSvg, "#121715"),
);
await fs.writeFile(
  path.join(logos, "TipHub-Symbol-Reversed-Chalk.svg"),
  recolor(symbolSvg, "#F2EBDD"),
);

for (const width of [1200, 600, 300]) {
  await sharp(Buffer.from(primarySvg))
    .resize({ width })
    .png()
    .toFile(path.join(logos, `TipHub-Logo-Primary-Full-Color-${width}px.png`));
  await sharp(Buffer.from(recolor(primarySvg, "#121715")))
    .resize({ width })
    .png()
    .toFile(path.join(logos, `TipHub-Logo-Primary-Monochrome-Carbon-${width}px.png`));
  await sharp(Buffer.from(recolor(primarySvg, "#F2EBDD")))
    .resize({ width })
    .png()
    .toFile(path.join(logos, `TipHub-Logo-Primary-Reversed-Chalk-${width}px.png`));
}

for (const width of [1024, 512, 256]) {
  await sharp(Buffer.from(symbolSvg))
    .resize({ width })
    .png()
    .toFile(path.join(logos, `TipHub-Symbol-Full-Color-${width}px.png`));
}

await fs.copyFile(faviconPath, path.join(favicons, "TipHub-Favicon.svg"));
for (const width of [512, 192, 180, 64, 48, 32, 16]) {
  await sharp(Buffer.from(faviconSvg))
    .resize({ width, height: width })
    .png()
    .toFile(path.join(favicons, `TipHub-Favicon-${width}x${width}.png`));
}
await fs.copyFile(
  path.join(favicons, "TipHub-Favicon-180x180.png"),
  path.join(favicons, "apple-touch-icon.png"),
);
await fs.copyFile(
  path.join(favicons, "TipHub-Favicon-192x192.png"),
  path.join(favicons, "android-chrome-192x192.png"),
);
await fs.copyFile(
  path.join(favicons, "TipHub-Favicon-512x512.png"),
  path.join(favicons, "android-chrome-512x512.png"),
);

const approvedImagery = [
  "tiphub-hero-background.png",
  "tiphub-hero.png",
  "what-we-back-atlas.png",
  "friction-map-strata.png",
  "essential-systems.png",
  "field-notes-atlas.png",
  "founder-operating-atlas.jpg",
];
for (const name of approvedImagery) {
  await fs.copyFile(path.join(root, "public", "assets", name), path.join(imagery, name));
}

const iconSet = [
  ["Arrow-Right", ArrowRight],
  ["Arrow-Up-Right", ArrowUpRight],
  ["Plus", Plus],
  ["Minus", Minus],
  ["Search", MagnifyingGlass],
  ["Menu-List", List],
  ["Close", X],
  ["LinkedIn", LinkedinLogo],
];
for (const [name, Icon] of iconSet) {
  const markup = renderToStaticMarkup(
    React.createElement(Icon, {
      size: 128,
      color: "#F05A32",
      weight: "regular",
      "aria-hidden": "true",
    }),
  );
  await sharp(Buffer.from(markup))
    .resize({ width: 128, height: 128 })
    .png()
    .toFile(path.join(iconography, `Phosphor-${name}-128px.png`));
}

console.log(out);
