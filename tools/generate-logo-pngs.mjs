import sharp from "sharp";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, "..", "public");
const assetsDir = join(__dirname, "..", "output", "brand-assets");

const markSvg = readFileSync(join(publicDir, "procuresource-logo-mark.svg"));
const logoSvg = readFileSync(join(publicDir, "procuresource-logo.svg"));

async function generate(filepath, svg, width, label = "", height = null) {
  const outputPath = `${filepath}${label ? `-${label}` : ""}.png`;
  await sharp(svg, {
    density: 600,
  })
    .resize(width, height, {
      fit: "contain",
      background: { r: 0, g: 113, b: 227, alpha: 1 },
    })
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(outputPath);
  console.log(`Generated: ${outputPath}`);
}

async function main() {
  // Mark/icon versions (square, exact sizes)
  await generate(join(assetsDir, "procuresource-mark"), markSvg, 32, "32", 32);
  await generate(join(assetsDir, "procuresource-mark"), markSvg, 180, "180", 180);
  await generate(join(assetsDir, "procuresource-mark"), markSvg, 192, "192", 192);
  await generate(join(assetsDir, "procuresource-mark"), markSvg, 512, "512", 512);
  await generate(join(assetsDir, "procuresource-mark"), markSvg, 1024, "1024", 1024);

  // Full logo lockup versions
  await generate(join(assetsDir, "procuresource-logo"), logoSvg, 600, "600");
  await generate(join(assetsDir, "procuresource-logo"), logoSvg, 1200, "1200");
  await generate(join(assetsDir, "procuresource-logo"), logoSvg, 2400, "2400");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
