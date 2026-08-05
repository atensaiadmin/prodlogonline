// Converts seeds/ideas-seed.json -> seeds/ideas-seed.csv for Supabase CSV import.
// Re-run with:  PRODLOG_USER_ID=<your-uid> node seeds/export-ideas-csv.cjs
const fs = require("fs");
const path = require("path");

const dir = __dirname;
const ideas = JSON.parse(
  fs.readFileSync(path.join(dir, "ideas-seed.json"), "utf8")
);

// Your Supabase user id (required because public.ideas.user_id is NOT NULL).
const USER_ID = process.env.PRODLOG_USER_ID || "";

// Columns match public.ideas (tags + links are jsonb -> JSON strings in CSV).
const columns = [
  "id",
  "title",
  "one_liner",
  "stage",
  "idea_type",
  "conviction",
  "tags",
  "links",
  "visibility",
  "user_id",
  "created_at",
  "updated_at",
];

function csvCell(value) {
  if (value === null || value === undefined) return "";
  const s = typeof value === "object" ? JSON.stringify(value) : String(value);
  // Quote when the value contains a comma, quote, or newline (standard CSV).
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

const rows = ideas.map((idea) =>
  columns.map((c) => (c === "user_id" ? csvCell(USER_ID) : csvCell(idea[c]))).join(",")
);
const csv = [columns.join(","), ...rows].join("\n");

const outPath = path.join(dir, "ideas-seed.csv");
fs.writeFileSync(outPath, csv);
console.log(`Wrote ${outPath} with ${ideas.length} rows`);
