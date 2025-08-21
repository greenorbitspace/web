import React, { useState, useMemo, useEffect } from "react";
import PaperCard from "./PaperCard.jsx";
import bibtexParse from "bibtex-parse-js";

// --- Author formatting ---
const cleanAuthorName = (name) =>
  name
    .trim()
    .split(/\s+/)
    .map((p) =>
      /^[A-Za-z]$/.test(p) ? p.toUpperCase() + "." : p[0].toUpperCase() + p.slice(1)
    )
    .join(" ");

const formatAuthors = (authorStr) => {
  if (!authorStr) return "Unknown";
  const authors = authorStr
    .split(/\s+and\s+/)
    .map((a) => cleanAuthorName(a.trim()));
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return authors.join(" & ");
  const last = authors.pop();
  return authors.join(", ") + " & " + last;
};

// --- Helpers ---
const stripBracesAndQuotes = (str) => (str || "").toString().replace(/[{}"]/g, "").trim();
const normalizeFilter = (str) => (str || "").toString().trim().toLowerCase();

const normalizePublisher = (pub) => {
  if (!pub) return "";
  let p = String(pub).trim();
  p = p.replace(/\bLTD\.?$/i, "Ltd");
  p = p.replace(/\bBV\b/i, "B.V.");
  p = p.replace(/\bINC\.?$/i, "Inc.");
  p = p.replace(/\bLLC\b/i, "LLC");
  return p;
};

const extractPublishers = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(normalizePublisher).filter(Boolean);
  if (typeof input === "string")
    return input.split(/[,;|]+/).map(normalizePublisher).filter(Boolean);
  return [normalizePublisher(input)].filter(Boolean);
};

const cleanKeyword = (kw) => stripBracesAndQuotes(kw).replace(/\[\d+\]/g, "").trim();

// --- Main component ---
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

          // Fallback ID for missing citationKey
          const id = e.citationKey && e.citationKey.trim() ? e.citationKey : `entry-${idx}`;

          // Normalize fields safely
          const title = stripBracesAndQuotes(tags.title) || "Untitled";
          const author = stripBracesAndQuotes(tags.author) || "Unknown";
          const year = stripBracesAndQuotes(tags.year) || "";
          const journal = stripBracesAndQuotes(tags.journal) || "";
          const publisher = stripBracesAndQuotes(tags.publisher) || "";
          const doi = stripBracesAndQuotes(tags.doi) || "";
          const url = stripBracesAndQuotes(tags.url) || "";
          const keywords = tags.keywords
            ? tags.keywords.split(/[,;]+/).map(cleanKeyword).filter(Boolean)
            : [];
          const note = stripBracesAndQuotes(tags.note) || "";

          return { id, type: e.entryType || "", title, author, year, journal, publisher, doi, url, keywords, note };
        });

        setPapers(entries);
      })
      .catch((err) => console.error("Error loading BibTeX:", err));
  }, []);

  // --- Dropdown values ---
  const allKeywords = useMemo(() => {
    const set = new Set();
    papers.forEach((p) => (p.keywords || []).forEach((k) => k && set.add(k)));
    return [...set].sort();
  }, [papers]);

  const allPublishers = useMemo(() => {
    const set = new Set();
    papers.forEach((p) => extractPublishers(p.publisher).forEach((pub) => set.add(pub)));
    return [...set].sort();
  }, [papers]);

  const allJournals = useMemo(
    () => [...new Set(papers.map((p) => p.journal).filter(Boolean))].sort(),
    [papers]
  );

  const allYears = useMemo(
    () => [...new Set(papers.map((p) => p.year).filter(Boolean))].sort(),
    [papers]
  );

  // --- Filtering with robust normalization ---
  const filteredPapers = useMemo(() => {
    const q = normalizeFilter(query);
    const kwFilter = normalizeFilter(selectedKeyword);
    const pubFilter = normalizeFilter(selectedPublisher);
    const journalFilter = normalizeFilter(selectedJournal);
    const yearFilter = normalizeFilter(selectedYear);

    return papers.filter((p) => {
      const authors = formatAuthors(p.author);
      const keywords = (p.keywords || []).map(normalizeFilter);
      const publishers = extractPublishers(p.publisher).map(normalizeFilter);
      const journal = normalizeFilter(p.journal);
      const year = normalizeFilter(p.year);

      return (
        (!q || normalizeFilter(p.title).includes(q) || normalizeFilter(authors).includes(q)) &&
        (!kwFilter || keywords.some((k) => k === kwFilter)) &&
        (!pubFilter || publishers.some((pub) => pub === pubFilter)) &&
        (!journalFilter || journal.includes(journalFilter)) &&
        (!yearFilter || year === yearFilter)
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
          cmp = normalizeFilter(formatAuthors(a.author)).localeCompare(normalizeFilter(formatAuthors(b.author)));
          break;
        case "title":
          cmp = normalizeFilter(a.title).localeCompare(normalizeFilter(b.title));
          break;
        case "publisher":
          cmp = normalizeFilter(extractPublishers(a.publisher)[0] || "").localeCompare(
            normalizeFilter(extractPublishers(b.publisher)[0] || "")
          );
          break;
        case "journal":
          cmp = normalizeFilter(a.journal).localeCompare(normalizeFilter(b.journal));
          break;
        default:
          cmp = 0;
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [filteredPapers, sortBy, sortAsc]);

  const handleHeaderClick = (field) => {
    if (sortBy === field) setSortAsc((prev) => !prev);
    else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

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
        {[
          { label: "Keyword", value: selectedKeyword, setter: setSelectedKeyword, options: allKeywords },
          { label: "Publisher", value: selectedPublisher, setter: setSelectedPublisher, options: allPublishers },
          { label: "Journal", value: selectedJournal, setter: setSelectedJournal, options: allJournals },
          { label: "Year", value: selectedYear, setter: setSelectedYear, options: allYears },
        ].map(({ label, value, setter, options }) => (
          <div key={label}>
            <label className="text-white block mb-1">{label}</label>
            <select
              value={value}
              onChange={(e) => setter(normalizeFilter(e.target.value))}
              className="w-full border rounded p-2 bg-gray-800 text-white"
            >
              <option value="">All</option>
              {options.map((opt) => (
                <option key={opt} value={normalizeFilter(opt)}>
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
              id={p.id}
              type={p.type}
              title={p.title}
              author={p.author}
              year={p.year}
              journal={p.journal}
              publisher={p.publisher}
              doi={p.doi}
              url={p.url}
              keywords={p.keywords}
              note={p.note}
              onKeywordClick={(tag) => setSelectedKeyword(normalizeFilter(tag))}
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