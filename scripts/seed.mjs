// One-time seed: ensure admin user, upload bundled images to Supabase Storage,
// and insert the starter artworks. Idempotent-ish: skips inserting if the
// artworks table already has rows.
//
// Run with:  node --env-file=.env.local scripts/seed.mjs [signup|run]
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const mode = process.argv[2] || "run";

if (!url || !anon || !email || !password) {
  console.error("Missing env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD");
  process.exit(1);
}

const supabase = createClient(url, anon, { auth: { persistSession: false } });

const ART = [
  { slug: "resurgence", title: "Resurgence", medium: "Oil on Canvas", dimensions: "30 × 40 in", price: "$5,000,000", year: "2024", collection: "masterpiece", file: "Resurgence.jpg", statement: "A bold meditation on rebirth — layered cracturism textures rising from darkness into gilded light." },
  { slug: "magnanimous", title: "Magnanimous", medium: "Oil on Canvas", dimensions: "15 × 23 in", price: "$1,000,000", year: "2024", collection: "masterpiece", file: "Magnanimous.jpg", statement: "Generous gestures of gold across a contemplative black field — abundance rendered in restraint." },
  { slug: "tranquil", title: "Tranquil", medium: "Oil on Canvas", dimensions: "15 × 23 in", price: "$500,000", year: "2023", collection: "masterpiece", file: "Tranquil.jpg", statement: "Floating dotism in its calmest form — a quiet, balanced rhythm that settles the room." },
  { slug: "aspire", title: "Aspire", medium: "Oil on Canvas", dimensions: "24 × 36 in", price: "$250,000", year: "2024", collection: "masterpiece", file: "Aspire.jpg", statement: "Upward movement captured in texture and line — an ode to ambition and elevation." },
  { slug: "echoes-of-awakening", title: "Echoes of Awakening", medium: "Oil on Canvas", dimensions: "24 × 24 in", price: "$80,000", year: "2023", collection: "limited", file: "EchoesofAwakening.jpg", statement: "The first stirrings of consciousness, echoing outward through celestial layers of pigment." },
  { slug: "ethereal-elegance", title: "Ethereal Elegance: Shadows in Celestial Mist", medium: "Oil on Canvas", dimensions: "26 × 28 in", price: "$75,000", year: "2023", collection: "limited", file: "EtherealEleganceShadowsinCelestialMist.jpg", statement: "Shadow and shimmer suspended in mist — delicate, luminous and endlessly refined." },
  { slug: "relentless", title: "Relentless", medium: "Oil on Canvas", dimensions: "30 × 40 in", price: "$120,000", year: "2024", collection: "limited", file: "Relentless.jpg", statement: "An unyielding energy driven through bold contrasts — momentum made visible." },
  { slug: "untitled-iii", title: "Untitled III", medium: "Oil on Canvas", dimensions: "12 × 12 in", price: "$100,000", year: "2023", collection: "masterpiece", file: "Untittled3.jpg", statement: "A study in intimate scale and maximal texture." },
  { slug: "untitled-iv", title: "Untitled IV", medium: "Oil on Canvas", dimensions: "12 × 12 in", price: "$100,000", year: "2023", collection: "masterpiece", file: "Untittled4.jpg", statement: "Cracturism explored within a perfect square." },
  { slug: "untitled-v", title: "Untitled V", medium: "Oil on Canvas", dimensions: "12 × 12 in", price: "$100,000", year: "2023", collection: "masterpiece", file: "Untittled5.jpg", statement: "Quiet gold tracings over a deep, brooding ground." },
  { slug: "untitled-i", title: "Untitled I", medium: "Acrylic on Canvas", dimensions: "12 × 12 in", price: "$1,000", year: "2022", collection: "modern", file: "Untittled1.jpg", statement: "An accessible entry into the artist's modern vocabulary." },
  { slug: "untitled-ii", title: "Untitled II", medium: "Acrylic on Canvas", dimensions: "12 × 12 in", price: "$1,000", year: "2022", collection: "modern", file: "Untittled2.jpg", statement: "Playful, contemporary and full of movement." },
];

async function ensureAdmin() {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error && !/already|registered/i.test(error.message)) {
    console.error("signUp error:", error.message);
    process.exit(1);
  }
  console.log("admin signUp ok (or already existed):", email);
}

async function signIn() {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (/confirm/i.test(error.message)) {
      console.error("NEEDS_CONFIRM");
      process.exit(2);
    }
    console.error("signIn error:", error.message);
    process.exit(1);
  }
}

async function run() {
  await signIn();

  const { data: cols, error: colErr } = await supabase.from("collections").select("id, slug");
  if (colErr) throw colErr;
  const colId = Object.fromEntries(cols.map((c) => [c.slug, c.id]));

  const { count } = await supabase.from("artworks").select("*", { count: "exact", head: true });
  if (count && count > 0) {
    console.log(`artworks already seeded (${count}) — skipping.`);
    return;
  }

  const assetsDir = path.resolve(fileURLToPath(import.meta.url), "../../src/assets");

  for (const [i, a] of ART.entries()) {
    const buf = await readFile(path.join(assetsDir, a.file));
    const objectPath = `${a.slug}.jpg`;
    const up = await supabase.storage
      .from("artworks")
      .upload(objectPath, buf, { contentType: "image/jpeg", upsert: true });
    if (up.error) throw up.error;

    const { data: pub } = supabase.storage.from("artworks").getPublicUrl(objectPath);

    const { error: insErr } = await supabase.from("artworks").insert({
      title: a.title,
      slug: a.slug,
      medium: a.medium,
      dimensions: a.dimensions,
      price: a.price,
      year: a.year,
      statement: a.statement,
      image_url: pub.publicUrl,
      collection_id: colId[a.collection] ?? null,
      is_featured: a.collection === "masterpiece",
      sort_order: i,
    });
    if (insErr) throw insErr;
    console.log(`seeded ${i + 1}/${ART.length}: ${a.title}`);
  }
  console.log("✓ seed complete");
}

if (mode === "signup") {
  await ensureAdmin();
} else {
  await ensureAdmin();
  await run();
}
