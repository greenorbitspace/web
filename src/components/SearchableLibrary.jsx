import React, { useState, useMemo } from "react";
import PaperCard from "./PaperCard.jsx";
import researchData from "../../public/data/research.json";

// --- Author formatting ---
function cleanAuthorName(name) {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .map(p => (/^[A-Za-z]$/.test(p) ? p.toUpperCase() + "." : p[0].toUpperCase() + p.slice(1)))
    .join(" ");
}

function formatAuthors(authorStr) {
  if (!authorStr) return "";
  const authors = authorStr.split(/\s+and\s+/).map(a => cleanAuthorName(a.trim()));
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return authors.join(" & ");
  const last = authors.pop();
  return authors.join(", ") + " & " + last;
}

// --- Normalization for sorting/searching ---
function normalizeString(str) {
  return (str || "").trim().toLowerCase();
}

function normalizeYear(year) {
  const y = parseInt(year, 10);
  return isNaN(y) ? 0 : y;
}

export default function SearchableLibrary() {
  const [query, setQuery] = useState("");
  const [activeKeywords, setActiveKeywords] = useState([]);
  const [sortBy, setSortBy] = useState("year"); // title, author, year
  const [sortAsc, setSortAsc] = useState(false); // ascending/descending

  // --- Filtering ---
  const filteredPapers = useMemo(() => {
    const q = query.toLowerCase();

    return researchData.filter(paper => {
      const authorsFormatted = formatAuthors(paper.author || "");
      const keywords = (paper.keywords || [])
        .filter(Boolean)
        .map(k => k.replace(/\[\d+\]/g, "").trim().toLowerCase()); // remove footnotes

      const matchesQuery =
        (paper.title && paper.title.toLowerCase().includes(q)) ||
        (authorsFormatted && authorsFormatted.toLowerCase().includes(q)) ||
        keywords.some(k => k.includes(q));

      const matchesKeywords =
        activeKeywords.length === 0 || activeKeywords.every(tag => keywords.includes(tag));

      return matchesQuery && matchesKeywords;
    });
  }, [query, activeKeywords]);

  // --- Sorting ---
  const sortedPapers = useMemo(() => {
    return [...filteredPapers].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "year":
          comparison = normalizeYear(a.year) - normalizeYear(b.year);
          break;
        case "author":
          comparison = normalizeString(formatAuthors(a.author)).localeCompare(
            normalizeString(formatAuthors(b.author))
          );
          break;
        case "title":
          comparison = normalizeString(a.title).localeCompare(normalizeString(b.title));
          break;
        default:
          comparison = 0;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredPapers, sortBy, sortAsc]);

  // --- Handlers ---
  const handleKeywordClick = (tag) => {
    setActiveKeywords(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleHeaderClick = (field) => {
    if (sortBy === field) {
      setSortAsc(prev => !prev); // toggle ascending/descending
    } else {
      setSortBy(field);
      setSortAsc(true); // default ascending
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-white">Library</h1>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search by title, author, keyword..."
        className="border p-2 rounded w-full mb-6"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      {/* Sort Headers */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-white font-semibold cursor-pointer border-b border-gray-600 pb-2">
        <div onClick={() => handleHeaderClick("title")}>
          Title {sortBy === "title" && (sortAsc ? "▲" : "▼")}
        </div>
        <div onClick={() => handleHeaderClick("author")}>
          Author {sortBy === "author" && (sortAsc ? "▲" : "▼")}
        </div>
        <div onClick={() => handleHeaderClick("year")}>
          Year {sortBy === "year" && (sortAsc ? "▲" : "▼")}
        </div>
      </div>

      {/* Paper Cards */}
      {sortedPapers.length === 0 ? (
        <p className="text-white">No papers match your search.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedPapers.map(paper => (
            <PaperCard
              key={paper.id}
              {...paper}
              onKeywordClick={handleKeywordClick}
              activeKeywords={activeKeywords}
            />
          ))}
        </div>
      )}
    </div>
  );
}