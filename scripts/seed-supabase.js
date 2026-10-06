const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.log("Supabase credentials not configured in environment. Skipping Supabase seeding.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Starting idempotent Supabase seed...");

  const creators = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/seed/creators.json"), "utf8"));
  const portfolio = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/seed/portfolio.json"), "utf8"));
  const briefs = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/seed/briefs.json"), "utf8"));
  const licenses = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/seed/tool-licenses.json"), "utf8"));
  const engagements = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/seed/engagements.json"), "utf8"));

  const { error: cErr } = await supabase.from("creators").upsert(creators);
  if (cErr) console.error("Error seeding creators:", cErr.message);
  else console.log(`Seeded ${creators.length} creators`);

  const { error: pErr } = await supabase.from("portfolio_items").upsert(portfolio);
  if (pErr) console.error("Error seeding portfolio:", pErr.message);
  else console.log(`Seeded ${portfolio.length} portfolio items`);

  const { error: bErr } = await supabase.from("briefs").upsert(briefs);
  if (bErr) console.error("Error seeding briefs:", bErr.message);
  else console.log(`Seeded ${briefs.length} briefs`);

  const { error: lErr } = await supabase.from("tool_licenses").upsert(licenses);
  if (lErr) console.error("Error seeding tool licenses:", lErr.message);
  else console.log(`Seeded ${licenses.length} tool licenses`);

  const { error: eErr } = await supabase.from("engagements").upsert(engagements);
  if (eErr) console.error("Error seeding engagements:", eErr.message);
  else console.log(`Seeded ${engagements.length} engagements`);

  console.log("Supabase seeding complete!");
}

seed().catch((err) => {
  console.error("Supabase seed failed:", err);
});
