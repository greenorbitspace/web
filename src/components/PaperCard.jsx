import React, { useState, useMemo } from "react";

// --- Helpers ---
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

const cleanKeyword = (kw) =>
  (kw || "").toString().replace(/[{}\"]/g, "").replace(/\[\d+\]/g, "").trim();

// --- Robust URL extractor ---
const extractUrl = (input) => {
  if (!input) return "";

  // Handle \url{...} or url{...}
  const match = input.match(/\\?url\{(.+?)\}/i);
  let url = match ? match[1] : input;

  url = url.replace(/^url[:\s]*?/i, "").trim();

  // Fix common malformed http/https
  url = url.replace(/^https?:\/\/\//i, "https://");
  url = url.replace(/^http:\/\/\//i, "http://");

  // Prepend http:// if no protocol present
  if (!/^https?:\/\//i.test(url)) url = "http://" + url;

  return url;
};

// --- Main PaperCard component ---
export default function PaperCard({
  id,
  type = "misc",
  title = "Untitled",
  author = "",
  year = "",
  journal = "",
  publisher = "",
  doi = "",
  url = "",
  pdf = "",
  howpublished = "",
  keywords = [],
  note = "",
  abstract = "",
  onKeywordClick = () => {},
  onPublisherClick = () => {},
  onJournalClick = () => {},
  activeKeywords = [],
  activePublisher = "",
  activeJournal = "",
}) {
  const [showAbstract, setShowAbstract] = useState(false);

  const formattedAuthor = useMemo(() => formatAuthors(author), [author]);
  const safeJournal = (journal || "").trim();
  const safeYear = (year || "").trim();

  const publishers = useMemo(() => {
    const list = extractPublishers(publisher);
    return list.length > 0 ? list : publisher ? [publisher] : [];
  }, [publisher]);

  const cleanedKeywords = useMemo(
    () => (keywords || []).filter(Boolean).map(cleanKeyword),
    [keywords]
  );

  // --- Resolve links separately ---
  const doiUrl = useMemo(() => (doi ? `https://doi.org/${doi}` : ""), [doi]);

  const pdfUrl = useMemo(() => {
    if (pdf) return extractUrl(pdf);
    if (howpublished && howpublished.toLowerCase().endsWith(".pdf")) return extractUrl(howpublished);
    return "";
  }, [pdf, howpublished]);

  const linkUrl = useMemo(() => {
    if (url && url !== pdfUrl && url !== doiUrl) return extractUrl(url);
    if (howpublished && !howpublished.toLowerCase().endsWith(".pdf") && howpublished !== doiUrl) return extractUrl(howpublished);
    return "";
  }, [url, howpublished, pdfUrl, doiUrl]);

  const bibtex = useMemo(() => {
    const fields = [
      `  title     = {${title}}`,
      author && `  author    = {${author}}`,
      safeYear && `  year      = {${safeYear}}`,
      safeJournal && `  journal   = {${safeJournal}}`,
      publishers.length > 0 && `  publisher = {${publishers.join(" and ")}}`,
      doi && `  doi       = {${doi}}`,
      pdfUrl && `  pdf       = {${pdfUrl}}`,
      linkUrl && `  url       = {${linkUrl}}`,
      note && `  note      = {${note}}`,
      cleanedKeywords.length > 0 && `  keywords  = {${cleanedKeywords.join(", ")}}`,
    ]
      .filter(Boolean)
      .join(",\n");

    return `@${type}{${id},\n${fields}\n}`;
  }, [id, type, title, author, safeYear, safeJournal, publishers, doi, pdfUrl, linkUrl, note, cleanedKeywords]);

  const handleCopyBibtex = () =>
    navigator.clipboard.writeText(bibtex).then(() => alert("BibTeX copied!"));

  return (
    <article className="bg-primary-500 shadow rounded-2xl p-6 hover:shadow-lg transition flex flex-col">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-accent-500">
        {formattedAuthor} {safeYear && `(${safeYear})`}
      </p>

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

      {abstract && (
        <div className="mt-3">
          <button
            onClick={() => setShowAbstract((prev) => !prev)}
            className="text-sm text-yellow-300 underline cursor-pointer mb-1"
          >
            {showAbstract ? "Hide Abstract" : "Show Abstract"}
          </button>
          {showAbstract && (
            <p className="text-sm text-gray-200 whitespace-pre-line">{abstract}</p>
          )}
        </div>
      )}

      {note && <p className="mt-2 text-sm text-gray-200">{note}</p>}

      <div className="mt-4 flex gap-3 flex-wrap">
        {doiUrl && (
          <a
            href={doiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            View DOI
          </a>
        )}

        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            View PDF
          </a>
        )}

        {linkUrl && (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            View Link
          </a>
        )}

        <button
          onClick={handleCopyBibtex}
          className="px-3 py-1 text-sm bg-accent-500 text-white rounded hover:bg-accent-700 transition"
        >
          Copy BibTeX
        </button>
      </div>
    </article>
  );
}