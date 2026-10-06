const fs = require("fs");
const path = require("path");

const manifestPath = path.join(__dirname, "../data/seed/media-manifest.json");
const publicDir = path.join(__dirname, "../public");

if (!fs.existsSync(manifestPath)) {
  console.error("Media manifest not found at:", manifestPath);
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
console.log(`Checking ${manifest.length} manifest media files in /public...`);

let missingCount = 0;

for (const entry of manifest) {
  const filePath = path.join(publicDir, entry.file);
  if (!fs.existsSync(filePath)) {
    missingCount++;
    console.log(`[MISSING MEDIA] Item: ${entry.item_id} | File: ${entry.file} | Ratio: ${entry.aspect_ratio}`);
  } else {
    console.log(`[OK] Item: ${entry.item_id} | File: ${entry.file}`);
  }
}

console.log("\n----------------------------------------");
if (missingCount > 0) {
  console.log(`Total missing media files: ${missingCount}. Component fallback plain grey box will be rendered for missing files.`);
} else {
  console.log("All media manifest files are present in /public!");
}
console.log("----------------------------------------\n");
