/**
 * scripts/inspect-response.mjs
 * ---------------------------------------------------------------------------
 * Fetches a few Angs and prints verse-level keys to find raag metadata.
 */

async function inspect(ang) {
  const url = `https://api.banidb.com/v2/angs/${ang}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    console.log(`\n=== Ang ${ang} === HTTP ${res.status}`);
    return;
  }
  const data = await res.json();
  const page = data.page ?? [];
  const first = page[0] ?? {};
  console.log(`\n=== Ang ${ang} ===`);
  console.log("Verse keys:", Object.keys(first));
  // Print just the top-level fields (not nested translation)
  const summary = {};
  for (const [k, v] of Object.entries(first)) {
    if (k === "translation") {
      summary[k] = "(omitted)";
    } else if (typeof v === "object" && v !== null) {
      summary[k] = JSON.stringify(v).slice(0, 200);
    } else {
      summary[k] = v;
    }
  }
  console.log("Summary:", JSON.stringify(summary, null, 2));
}

async function main() {
  // Check Angs that should be in known raags
  const testAngs = [14, 94, 151, 262, 347, 462, 527, 537, 595, 660, 696, 711, 721, 728, 795, 859, 885, 917, 975, 989, 1107, 1118, 1125, 1168, 1197, 1254, 1294, 1319, 1327, 1353];
  for (const a of testAngs) {
    await inspect(a);
    await new Promise(r => setTimeout(r, 300));
  }
}

main().catch(console.error);
