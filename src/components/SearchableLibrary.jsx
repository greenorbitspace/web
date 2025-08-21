import React, { useState, useMemo, useEffect } from "react";
import PaperCard from "./PaperCard.jsx";
import bibtexParse from "bibtex-parse-js";

// --- Helpers ---
const strip = (str) => (str || "").toString().replace(/[{}\"]/g, "").trim();
const normalize = (str) => (str || "").toString().trim().toLowerCase();

const cleanAuthorName = (name) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .map((p) =>
      /^[A-Za-z]$/.test(p) ? p.toUpperCase() + "." : p[0].toUpperCase() + p.slice(1)
    )
    .join(" ");

const formatAuthors = (authorStr) => {
  if (!authorStr) return "";
  const authors = authorStr.split(/\s+and\s+/).map((a) => cleanAuthorName(a.trim()));
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return authors.join(" & ");
  const last = authors.pop();
  return authors.join(", ") + " & " + last;
};

const normalizePublisher = (pub) => {
  if (!pub) return "";
  return String(pub)
    .trim()
    .replace(/\bLTD\.?$/i, "Ltd")
    .replace(/\bBV\b/i, "B.V.")
    .replace(/\bINC\.?$/i, "Inc.")
    .replace(/\bLLC\b/i, "LLC");
};

const extractPublishers = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(normalizePublisher).filter(Boolean);
  if (typeof input === "string")
    return input.split(/[,;|]+/).map(normalizePublisher).filter(Boolean);
  return [normalizePublisher(input)].filter(Boolean);
};

const cleanKeyword = (kw) => strip(kw).replace(/\[\d+\]/g, "").trim();

// --- Robust URL extractor ---
const extractUrl = (str) => {
  if (!str) return "";
  let url = str;

  const match = str.match(/\\?url\{(.+?)\}/i);
  if (match) url = match[1];

  url = url.replace(/^url[:\s]*/i, "").trim();

  // Fix malformed https:// or http//
  url = url.replace(/^(https?:)\/\/+/i, "$1//");

  if (!/^https?:\/\//i.test(url)) url = "http://" + url;

  return url;
};

// --- Smart link resolver ---
const resolveLinks = ({ doi, pdf, url, howpublished }) => {
  let doiUrl = doi ? `https://doi.org/${doi}` : "";
  let pdfUrl = pdf ? extractUrl(pdf) : "";
  let linkUrl = url ? extractUrl(url) : "";

  if (howpublished) {
    const hp = howpublished.trim();

    const doiMatch = hp.match(/doi\.org\/(10\.\d{4,9}\/[-._;()\/:A-Z0-9]+)/i);
    if (doiMatch && !doiUrl) doiUrl = `https://doi.org/${doiMatch[1]}`;

    const pdfMatch = hp.match(/https?:\/\/\S+\.pdf/i);
    if (pdfMatch && !pdfUrl) pdfUrl = pdfMatch[0];

    if (!pdfUrl && !doiUrl && !linkUrl) {
      linkUrl = extractUrl(hp);
    }
  }

  if (linkUrl === pdfUrl || linkUrl === doiUrl) linkUrl = "";

  return { doiUrl, pdfUrl, linkUrl };
};

// --- Main Component ---
export default function SearchableLibrary() {
  const [papers, setPapers] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [selectedJournal, setSelectedJournal] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [sortBy, setSortBy] = useState("year");
  const [sortAsc, setSortAsc] = useState(false);

  // --- Load BibTeX ---
  useEffect(() => {
    fetch("/data/export.bib")
      .then((res) => res.text())
      .then((text) => {
        const entries = bibtexParse.toJSON(text).map((e, idx) => {
          const tags = Object.fromEntries(
            Object.entries(e.entryTags || {}).map(([k, v]) => [k.toLowerCase(), v])
          );

          const id = e.citationKey?.trim() || `entry-${idx}`;
          const title = strip(tags.title) || "Untitled";
          const author = strip(tags.author) || "";
          const year = strip(tags.year) || "";
          const journal = strip(tags.journal) || "";
          const publisher = strip(tags.publisher) || "";
          const doi = strip(tags.doi) || "";
          const howpublished = strip(tags.howpublished) || "";
          const urlRaw = strip(tags.url) || howpublished;

          const { doiUrl, pdfUrl, linkUrl } = resolveLinks({
            doi,
            pdf: urlRaw.toLowerCase().endsWith(".pdf") ? urlRaw : "",
            url: urlRaw,
            howpublished,
          });

          const keywords = tags.keywords
            ? tags.keywords.split(/[,;]+/).map(cleanKeyword).filter(Boolean)
            : [];
          const note = strip(tags.note) || "";

          return {
            id,
            type: e.entryType || "misc",
            title,
            author,
            year,
            journal,
            publisher,
            doi,
            pdf: pdfUrl,
            url: linkUrl,
            howpublished,
            keywords,
            note,
          };
        });
        setPapers(entries);
      })
      .catch((err) => console.error("Error loading BibTeX:", err));
  }, []);

  // --- Dropdown options ---
  const allKeywords = useMemo(
    () => [...new Set(papers.flatMap((p) => p.keywords || []))].sort(),
    [papers]
  );
  const allPublishers = useMemo(
    () => [...new Set(papers.flatMap((p) => extractPublishers(p.publisher)))].sort(),
    [papers]
  );
  const allJournals = useMemo(
    () => [...new Set(papers.map((p) => p.journal).filter(Boolean))].sort(),
    [papers]
  );
  const allYears = useMemo(
    () => [...new Set(papers.map((p) => p.year).filter(Boolean))].sort(),
    [papers]
  );

  const filters = [
    { label: "Keyword", value: selectedKeyword, setter: setSelectedKeyword, options: allKeywords },
    { label: "Publisher", value: selectedPublisher, setter: setSelectedPublisher, options: allPublishers },
    { label: "Journal", value: selectedJournal, setter: setSelectedJournal, options: allJournals },
    { label: "Year", value: selectedYear, setter: setSelectedYear, options: allYears },
  ];

  // --- Filtering ---
  const filteredPapers = useMemo(() => {
    const q = normalize(query);
    return papers.filter((p) => {
      const authors = formatAuthors(p.author);
      const keywords = (p.keywords || []).map(normalize);
      const publishers = extractPublishers(p.publisher).map(normalize);
      const journal = normalize(p.journal);
      const year = normalize(p.year);

      return (
        (!q || normalize(p.title).includes(q) || normalize(authors).includes(q)) &&
        (!selectedKeyword || keywords.includes(normalize(selectedKeyword))) &&
        (!selectedPublisher || publishers.includes(normalize(selectedPublisher))) &&
        (!selectedJournal || journal.includes(normalize(selectedJournal))) &&
        (!selectedYear || year === normalize(selectedYear))
      );
    });
  }, [papers, query, selectedKeyword, selectedPublisher, selectedJournal, selectedYear]);

  // --- Sorting ---
  const sortedPapers = useMemo(() => {
    return [...filteredPapers].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "year":
          cmp = (parseInt(a.year) || 0) - (parseInt(b.year) || 0);
          break;
        case "author":
          cmp = normalize(formatAuthors(a.author)).localeCompare(
            normalize(formatAuthors(b.author))
          );
          break;
        case "title":
          cmp = normalize(a.title).localeCompare(normalize(b.title));
          break;
        case "publisher":
          cmp = normalize(extractPublishers(a.publisher)[0] || "").localeCompare(
            normalize(extractPublishers(b.publisher)[0] || "")
          );
          break;
        case "journal":
          cmp = normalize(a.journal).localeCompare(normalize(b.journal));
          break;
        default:
          cmp = 0;
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [filteredPapers, sortBy, sortAsc]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-white">Library</h1>

      <input
        type="text"
        placeholder="Search by title or author..."
        className="border p-2 rounded w-full mb-4 bg-gray-800 text-white"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {filters.map(({ label, value, setter, options }) => (
          <div key={label}>
            <label className="text-white block mb-1">{label}</label>
            <select
              value={value}
              onChange={(e) => setter(normalize(e.target.value))}
              className="w-full border rounded p-2 bg-gray-800 text-white"
            >
              <option value="">All</option>
              {options.map((opt) => (
                <option key={opt} value={normalize(opt)}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {sortedPapers.length === 0 ? (
        <p className="text-white">No papers match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedPapers.map((p) => (
            <PaperCard
              key={p.id || p.title}
              {...p}
              onKeywordClick={(tag) => setSelectedKeyword(normalize(tag))}
              activeKeywords={selectedKeyword ? [selectedKeyword] : []}
              activePublisher={selectedPublisher}
              activeJournal={selectedJournal}
            />
          ))}
        </div>
      )}
    </div>
  );
}