import React from "react";

// Inline formatting parser (same as before)
function parseInlineFormatting(text) {
  if (!text) return null;

  // Links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  text = text.split(linkRegex).map((part, i) => {
    if (i % 3 === 1) return <span key={`link-text-${i}`}>{part}</span>;
    if (i % 3 === 2) {
      return (
        <a
          key={`link-url-${i}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </a>
      );
    }
    return part;
  }).flat();

  // Bold
  const boldRegex = /\*\*([^\*]+)\*\*/g;
  text = text.map((chunk, i) =>
    typeof chunk === "string"
      ? chunk.split(boldRegex).map((sub, j) =>
          j % 2 === 1 ? <strong key={`b-${i}-${j}`}>{sub}</strong> : sub
        )
      : chunk
  ).flat();

  // Italic
  const italicRegex = /\*([^\*]+)\*/g;
  text = text.map((chunk, i) =>
    typeof chunk === "string"
      ? chunk.split(italicRegex).map((sub, j) =>
          j % 2 === 1 ? <em key={`i-${i}-${j}`}>{sub}</em> : sub
        )
      : chunk
  ).flat();

  return text;
}

export default function EventDescription({ summary, description, location, url, categories }) {
  if (!summary && !description) return null;

  const lines = description ? description.split("\n") : [];
  const content = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // First line after summary → h2
    if (i === 0) {
      content.push(
        <h2 key={`h2-${i}`} className="text-2xl font-bold mt-4 mb-2">
          {parseInlineFormatting(trimmed)}
        </h2>
      );
      return;
    }

    // Heading detection (short phrases without punctuation → h3)
    if (
      trimmed.length < 60 && // heuristics: short text = heading
      !trimmed.includes(".") && 
      !trimmed.includes(",") &&
      /^[A-Z]/.test(trimmed)
    ) {
      content.push(
        <h3 key={`h3-${i}`} className="text-xl font-semibold mt-4 mb-2">
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
      {/* Event summary as big heading */}
      {summary && <h2 className="mb-4">{summary}</h2>}

      {/* Description content */}
      {content}

      {/* Location */}
      {location && (
        <p className="mt-4 italic">📍 {location}</p>
      )}

      {/* Link */}
      {url && (
        <p className="mt-2">
          <strong>
            The{" "}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              official event page
            </a>
          </strong>
        </p>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((cat, idx) => (
            <span
              key={idx}
              className="bg-accent-500 text-black px-3 py-1 rounded-full text-sm font-medium"
            >
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}