import React, { useMemo, useState } from "react";

// --- Author formatting ---
function cleanAuthorName(name) {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .map(p =>
      /^[A-Za-z]$/.test(p) ? p.toUpperCase() + "." : p[0].toUpperCase() + p.slice(1)
    )
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

// --- Clean keyword ---
function cleanKeyword(kw) {
  return kw.replace(/\[\d+\]/g, "").trim();
}

// --- Normalize publisher ---
function normalizePublisher(pub) {
  if (!pub) return "";
  let p = String(pub).trim();
  p = p.replace(/\bLTD\.?$/i, "Ltd");
  p = p.replace(/\bBV\b/i, "B.V.");
  p = p.replace(/\bINC\.?$/i, "Inc.");
  p = p.replace(/\bLLC\b/i, "LLC");
  return p;
}

// --- Extract multiple publishers ---
function extractPublishers(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(normalizePublisher).filter(Boolean);
  if (typeof input === "string") {
    return input.split(/[,;|]+/).map(normalizePublisher).filter(Boolean);
  }
  return [normalizePublisher(input)].filter(Boolean);
}

export default function PaperCard({
  id,
  type = "article",
  title = "Untitled",
  author = "Unknown",
  year = "",
  journal = "",
  publisher = "",
  doi = "",
  url = "",
  keywords = [],
  note = "",
  abstract = "",
  onKeywordClick = () => {},
  onPublisherClick = () => {},
  onJournalClick = () => {},
  activeKeywords = [],
  activePublisher = "",
  activeJournal = ""
}) {
  const [showAbstract, setShowAbstract] = useState(false);

  const formattedAuthor = useMemo(() => formatAuthors(author), [author]);
  const safeJournal = String(journal || "").trim();
  const safeYear = String(year || "").trim();
  const publishers = useMemo(() => extractPublishers(publisher), [publisher]);
  const cleanedKeywords = useMemo(
    () => (keywords || []).filter(Boolean).map(k => cleanKeyword(k)),
    [keywords]
  );

  const bibtex = useMemo(
    () => `@${type}{${id},
  title = {${title}},
  author = {${author}},
  year = {${safeYear}},
  journal = {${safeJournal}},
  publisher = {${publishers.join(" and ")}},
  doi = {${doi}},
  url = {${url}}
}`,
    [id, type, title, author, safeYear, safeJournal, publishers, doi, url]
  );

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtex).then(() => alert("BibTeX copied!"));
  };

  return (
    <article className="bg-primary-500 shadow rounded-2xl p-6 hover:shadow-lg transition flex flex-col">
      {/* Title & Author */}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-accent-500">
        {formattedAuthor} {safeYear && `(${safeYear})`}
      </p>

      {/* Journal */}
      {safeJournal && (
        <div className="mt-1 italic text-purple-300">
          <span
            onClick={() => onJournalClick(safeJournal)}
            className={`cursor-pointer ${safeJournal === activeJournal ? "underline font-bold" : ""}`}
          >
            {safeJournal.toUpperCase()}
          </span>
        </div>
      )}

      {/* Publishers */}
      {publishers.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {publishers.map((pub, idx) => (
            <span
              key={idx}
              onClick={() => onPublisherClick(pub)}
              className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
                pub === activePublisher
                  ? "bg-accent-500 text-white"
                  : "bg-green-200 text-green-800 hover:bg-green-300"
              }`}
            >
              {pub}
            </span>
          ))}
        </div>
      )}

      {/* Keywords */}
      {cleanedKeywords.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {cleanedKeywords.map((tag, index) => {
            const isActive = activeKeywords.includes(tag.toLowerCase());
            return (
              <span
                key={index}
                onClick={() => onKeywordClick(tag.toLowerCase())}
                className={`text-xs px-2 py-1 rounded cursor-pointer ${
                  isActive
                    ? "bg-accent-500 text-white"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}

      {/* Abstract / Description */}
      {abstract && (
        <div className="mt-3">
          <button
            onClick={() => setShowAbstract(!showAbstract)}
            className="text-sm text-yellow-300 underline cursor-pointer mb-1"
          >
            {showAbstract ? "Hide Abstract" : "Show Abstract"}
          </button>
          {showAbstract && (
            <p className="text-sm text-gray-200 whitespace-pre-line">{abstract}</p>
          )}
        </div>
      )}

      {/* Note */}
      {note && <p className="mt-2 text-sm text-gray-200">{note}</p>}

      {/* Buttons */}
      <div className="mt-4 flex gap-3 flex-wrap">
        {doi && (
          <a
            href={`https://doi.org/${doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            View DOI
          </a>
        )}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            View PDF
          </a>
        )}
        <button
          className="px-3 py-1 text-sm bg-accent-500 text-white rounded hover:bg-accent-700 transition"
          onClick={handleCopyBibtex}
        >
          Copy BibTeX
        </button>
      </div>
    </article>
  );
}