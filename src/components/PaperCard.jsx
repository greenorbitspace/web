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

const extractUrl = (input) => {
  if (!input) return "";
  const match = input.match(/\\?url\{(.+?)\}/i);
  let url = match ? match[1] : input;
  url = url.replace(/^url[:\s]*?/i, "").trim();
  url = url.replace(/^https?:\/\/\//i, "https://").replace(/^http:\/\/\//i, "http://");
  if (!/^https?:\/\//i.test(url)) url = "http://" + url;
  return url;
};

// --- PaperCard Component ---
export default function PaperCard({
  id,
  type = "misc",
  title = "Untitled",
  author = "",
  year = "",
  journal = "",
  booktitle = "",
  publisher = "",
  doi = "",
  url = "",
  pdf = "",
  howpublished = "",
  keywords = [],
  note = "",
  abstract = "",
  sdgIcons = [], // SDG icon array
  onKeywordClick = () => {},
  onPublisherClick = () => {},
  onJournalClick = () => {},
  activeKeywords = [],
  activePublisher = "",
  activeJournal = "",
  cardBg = "bg-white",
  titleClass = "text-primary-500",
}) {
  const [showAbstract, setShowAbstract] = useState(false);

  const formattedAuthor = useMemo(() => formatAuthors(author), [author]);
  const safeYear = (year || "").trim();
  const venue = (journal || booktitle || "").trim();

  const publishers = useMemo(() => {
    const list = extractPublishers(publisher);
    return list.length > 0 ? list : publisher ? [publisher] : [];
  }, [publisher]);

  const cleanedKeywords = useMemo(
    () => (keywords || []).filter(Boolean).map(cleanKeyword),
    [keywords]
  );

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
      venue && `  journal/booktitle = {${venue}}`,
      publishers.length > 0 && `  publisher = {${publishers.join(" and ")}}`,
      doi && `  doi       = {${doi}}`,
      pdfUrl && `  pdf       = {${pdfUrl}}`,
      linkUrl && `  url       = {${linkUrl}}`,
      note && `  note      = {${note}}`,
      cleanedKeywords.length > 0 && `  keywords  = {${cleanedKeywords.join(", ")}}`,
    ].filter(Boolean).join(",\n");
    return `@${type}{${id},\n${fields}\n}`;
  }, [id, type, title, author, safeYear, venue, publishers, doi, pdfUrl, linkUrl, note, cleanedKeywords]);

  const handleCopyBibtex = () => navigator.clipboard.writeText(bibtex).then(() => alert("BibTeX copied!"));

  return (
    <article className={`${cardBg} shadow rounded-2xl p-6 hover:shadow-lg transition flex flex-col`}>
      <h3 className={`text-lg font-semibold ${titleClass}`}>{title}</h3>
      <p className="text-sm text-accent-500">
        {formattedAuthor} {safeYear && `(${safeYear})`}
      </p>

      {venue && (
        <div className="mt-1 italic text-gray-500">
          <span
            onClick={() => onJournalClick(venue)}
            className={`cursor-pointer ${venue === activeJournal ? "underline font-bold" : ""}`}
          >
            {venue.toUpperCase()}
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
          {cleanedKeywords.map((kw, idx) => (
            <span
              key={idx}
              onClick={() => onKeywordClick(kw.toLowerCase())}
              className={`text-xs px-2 py-1 rounded cursor-pointer ${
                activeKeywords.includes(kw.toLowerCase())
                  ? "bg-accent-500 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {sdgIcons.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">{sdgIcons}</div>
      )}

      {abstract && (
        <div className="mt-3">
          <button
            onClick={() => setShowAbstract(prev => !prev)}
            className="text-sm text-yellow-500 underline cursor-pointer mb-1"
          >
            {showAbstract ? "Hide Abstract" : "Show Abstract"}
          </button>
          {showAbstract && <p className="text-sm text-gray-700 whitespace-pre-line">{abstract}</p>}
        </div>
      )}

      {note && <p className="mt-2 text-sm text-gray-600">{note}</p>}

      <div className="mt-4 flex gap-3 flex-wrap">
        {doiUrl && (
          <a href={doiUrl} target="_blank" rel="noopener noreferrer"
             className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            View DOI
          </a>
        )}
        {pdfUrl && (
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
             className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition">
            View PDF
          </a>
        )}
        {linkUrl && (
          <a href={linkUrl} target="_blank" rel="noopener noreferrer"
             className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition">
            View Link
          </a>
        )}
        <button onClick={handleCopyBibtex}
                className="px-3 py-1 text-sm bg-accent-500 text-white rounded hover:bg-accent-700 transition">
          Copy BibTeX
        </button>
      </div>
    </article>
  );
}