const fs = require("fs");
const path = require("path");
const https = require("https");

const publicSeedDir = path.join(__dirname, "../public/seed");
if (!fs.existsSync(publicSeedDir)) {
  fs.mkdirSync(publicSeedDir, { recursive: true });
}

const downloads = [
  // Avatars (Unsplash portraits)
  {
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    file: "avatar_dev.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    file: "avatar_maya.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    file: "avatar_kavya.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    file: "avatar_marcus.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
    file: "avatar_aarav.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    file: "avatar_elena.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    file: "avatar_rohan.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
    file: "avatar_sofia.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    file: "avatar_tariq.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
    file: "avatar_ananya.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80",
    file: "avatar_kenji.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    file: "avatar_priya.jpg",
  },

  // Portfolio Images
  {
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    file: "sneaker_thumb2.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
    file: "sneaker_thumb3.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    file: "fintech_169.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    file: "fintech_thumb2.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    file: "fintech_thumb3.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80",
    file: "jewellery_11.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80",
    file: "fashion_45.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80",
    file: "fashion_thumb3.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    file: "gaming_169.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
    file: "music_thumb2.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80",
    file: "music_thumb3.jpg",
  },

  // Sample MP4 videos
  {
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    file: "sneaker_916.mp4",
  },
  {
    url: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
    file: "perfume_916.mp4",
  },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(dest);

    const request = (targetUrl) => {
      https
        .get(targetUrl, (response) => {
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            return request(response.headers.location);
          }
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download ${targetUrl}, status code: ${response.statusCode}`));
            return;
          }
          response.pipe(fileStream);
          fileStream.on("finish", () => {
            fileStream.close(resolve);
          });
        })
        .on("error", (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
    };

    request(url);
  });
}

async function downloadAll() {
  console.log(`Downloading ${downloads.length} media assets from public CDN sources into /public/seed...`);
  for (const item of downloads) {
    const dest = path.join(publicSeedDir, item.file);
    try {
      console.log(`Downloading ${item.file}...`);
      await downloadFile(item.url, dest);
      console.log(`[OK] Saved ${item.file}`);
    } catch (err) {
      console.error(`[ERROR] ${item.file}:`, err.message);
    }
  }
  console.log("\nAll seed media assets downloaded successfully!");
}

downloadAll();
