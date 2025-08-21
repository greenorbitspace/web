import React from "react";

// Inline formatting parser: linked images, images, links, bold, italic
function parseInlineFormatting(text) {
  if (!text) return null;

  let elements = [text];

  // Linked images: [![alt](src)](href)
  const linkedImageRegex = /\[\!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g;
  elements = elements.flatMap((chunk, i) => {
    if (typeof chunk !== "string") return chunk;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = linkedImageRegex.exec(chunk)) !== null) {
      if (match.index > lastIndex) parts.push(chunk.slice(lastIndex, match.index));
      parts.push(
        <a key={`linked-img-${i}-${match.index}`} href={match[3]} target="_blank" rel="noopener noreferrer">
          <img src={match[2]} alt={match[1] || ""} className="my-4 rounded shadow" />
        </a>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < chunk.length) parts.push(chunk.slice(lastIndex));
    return parts;
  });

  // Regular images: ![alt](src)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  elements = elements.flatMap((chunk, i) => {
    if (typeof chunk !== "string") return chunk;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = imageRegex.exec(chunk)) !== null) {
      if (match.index > lastIndex) parts.push(chunk.slice(lastIndex, match.index));
      parts.push(
        <img key={`img-${i}-${match.index}`} src={match[2]} alt={match[1] || ""} className="my-4 rounded shadow" />
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < chunk.length) parts.push(chunk.slice(lastIndex));
    return parts;
  });

  // Links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  elements = elements.flatMap((chunk, i) => {
    if (typeof chunk !== "string") return chunk;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(chunk)) !== null) {
      if (match.index > lastIndex) parts.push(chunk.slice(lastIndex, match.index));
      parts.push(
        <a key={`link-${i}-${match.index}`} href={match[2]} target="_blank" rel="noopener noreferrer">
          {match[1]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < chunk.length) parts.push(chunk.slice(lastIndex));
    return parts;
  });

  // Bold: **text**
  const boldRegex = /\*\*([^\*]+)\*\*/g;
  elements = elements.flatMap((chunk, i) =>
    typeof chunk === "string"
      ? chunk.split(boldRegex).map((sub, j) => (j % 2 === 1 ? <strong key={`b-${i}-${j}`}>{sub}</strong> : sub))
      : chunk
  );

  // Italic: *text*
  const italicRegex = /\*([^\*]+)\*/g;
  elements = elements.flatMap((chunk, i) =>
    typeof chunk === "string"
      ? chunk.split(italicRegex).map((sub, j) => (j % 2 === 1 ? <em key={`i-${i}-${j}`}>{sub}</em> : sub))
      : chunk
  );

  return elements;
}

export default function EventDescription({ summary, description, location, url, categories }) {
  if (!summary && !description) return null;

  const lines = description ? description.split("\n") : [];
  const content = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Detect headings starting with ###
    if (trimmed.startsWith("###")) {
      content.push(
        <h3 key={`h3-${i}`} className="text-xl font-semibold mt-4 mb-2">
          {parseInlineFormatting(trimmed.replace(/^###\s*/, ""))}
        </h3>
      );
      return;
    }

    // Short headings without punctuation
    if (trimmed.length < 60 && !/[.,]/.test(trimmed) && /^[A-Z]/.test(trimmed)) {
      content.push(
        <h3 key={`h3-short-${i}`} className="text-xl font-semibold mt-4 mb-2">
          {parseInlineFormatting(trimmed)}
        </h3>
      );
      return;
    }

    // Default paragraph
    content.push(
      <p key={`p-${i}`} className="mb-2">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  });

  return (
    <div className="tribe-events-single-event-description tribe-events-content">
      {/* Summary */}
      {summary && <h2 className="mb-4 text-3xl font-bold">{summary}</h2>}

      {/* Description content */}
      {content}

      {/* Location */}
      {location && <p className="mt-4 italic">📍 {location}</p>}

      {/* Event page link */}
      {url && (
        <p className="mt-2">
          <strong>
            The{" "}
            <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
              official event page
            </a>
          </strong>
        </p>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((cat, idx) => (
            <span key={idx} className="bg-accent-500 text-black px-3 py-1 rounded-full text-sm font-medium">
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}