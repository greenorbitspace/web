import React, { useMemo } from "react";

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

// --- Clean keyword (remove footnotes) ---
function cleanKeyword(kw) {
  return kw.replace(/\[\d+\]/g, "").trim().toLowerCase();
}

export default function PaperCard({
  id,
  type = "article",
  title = "Untitled",
  author = "Unknown",
  year = "",
  journal = "",
  doi = "",
  url = "",
  keywords = [],
  note = "",
  onKeywordClick = () => {},
  activeKeywords = []
}) {
  const formattedAuthor = useMemo(() => formatAuthors(author), [author]);

  const bibtex = useMemo(() => `@${type}{${id},
  title = {${title}},
  author = {${author}},
  year = {${year}},
  journal = {${journal}},
  doi = {${doi}},
  url = {${url}}
}`, [id, type, title, author, year, journal, doi, url]);

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtex).then(() => alert("BibTeX copied!"));
  };

  const cleanedKeywords = useMemo(
    () => keywords.filter(Boolean).map(k => cleanKeyword(k)),
    [keywords]
  );

  return (
    <article className="bg-primary-500 shadow rounded-2xl p-4 hover:shadow-lg transition flex flex-col">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-accent-500">{formattedAuthor} ({year})</p>
      {journal && <p className="italic text-white">{journal}</p>}

      {cleanedKeywords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {cleanedKeywords.map((tag, index) => {
            const isActive = activeKeywords.includes(tag);
            return (
              <span
                key={index}
                onClick={() => onKeywordClick(tag)}
                className={`text-xs px-2 py-1 rounded cursor-pointer ${
                  isActive
                    ? "bg-accent-500 text-white"
                    : "bg-white text-accent-500 hover:bg-gray-200"
                }`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}

      {note && <p className="mt-2 text-sm text-gray-200">{note}</p>}

      {/* Buttons */}
      <div className="mt-3 flex gap-3">
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