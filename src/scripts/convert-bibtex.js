import fs from "fs";
import path from "path";
import bibtexParse from "bibtex-parse-js";

// Resolve path relative to this script
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Correct path to the BibTeX file
const bibFilePath = path.join(__dirname, "../data/export.bib");

const bibData = fs.readFileSync(bibFilePath, "utf8");
const parsed = bibtexParse.toJSON(bibData);

const formatted = parsed.map(entry => {
  const fields = entry.entryTags || {};
  return {
    id: entry.citationKey,
    type: entry.entryType,
    title: fields.title || "",
    author: fields.author || "",        // ✅ keep author
    publisher: fields.publisher || "",  // ✅ also keep publisher
    year: fields.year || "",
    journal: fields.journal || "",
    doi: fields.doi || "",
    url: fields.url || "",
    keywords: (fields.keywords || "").split(",").map(k => k.trim()).filter(Boolean),
    note: fields.note || ""
  };
});

// Write JSON to public folder
const outputPath = path.join(__dirname, "../../public/data/research.json");
fs.writeFileSync(outputPath, JSON.stringify(formatted, null, 2));

console.log(`✅ Converted ${formatted.length} entries to research.json`);