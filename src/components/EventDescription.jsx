import React from "react";

// Inline formatting parser
function parseInlineFormatting(text) {
  if (!text) return null;

  let parts = [text];

  // Images ![alt](url "title")
  parts = parts.flatMap((part, i) => {
    if (typeof part !== "string") return part;
    const regex = /!\[([^\]]*)\]\((\S+?)(?:\s+"(.*?)")?\)/g;
    const pieces = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(part)) !== null) {
      const [fullMatch, alt, url, title] = match;
      const start = match.index;

      if (start > lastIndex) pieces.push(part.slice(lastIndex, start));

      pieces.push(
        <img
          key={`img-${i}-${start}`}
          src={url}
          alt={alt}
          title={title || alt}
          className="inline-block max-w-full rounded mb-1"
        />
      );

      lastIndex = start + fullMatch.length;
    }

    if (lastIndex < part.length) pieces.push(part.slice(lastIndex));

    return pieces;
  });

  // Links [text](url "title")
  parts = parts.flatMap((part, i) => {
    if (typeof part !== "string") return part;
    const regex = /\[([^\]]+)\]\((\S+?)(?:\s+"(.*?)")?\)/g;
    const pieces = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(part)) !== null) {
      const [fullMatch, linkText, linkUrl, title] = match;
      const start = match.index;

      if (start > lastIndex) pieces.push(part.slice(lastIndex, start));

      pieces.push(
        <a
          key={`a-${i}-${start}`}
          href={linkUrl}
          title={title || linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-500 font-semibold underline"
        >
          {linkText}
        </a>
      );

      lastIndex = start + fullMatch.length;
    }

    if (lastIndex < part.length) pieces.push(part.slice(lastIndex));

    return pieces;
  });

  // Bold **text**
  parts = parts.flatMap((part, i) => {
    if (typeof part !== "string") return part;
    return part.split(/(\*\*.*?\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={`b-${i}-${j}`} className="font-bold">
          {p.slice(2, -2)}
        </strong>
      ) : (
        p
      )
    );
  });

  // Italic *text*
  parts = parts.flatMap((part, i) => {
    if (typeof part !== "string") return part;
    return part.split(/(\*.*?\*)/g).map((p, j) =>
      p.startsWith("*") && p.endsWith("*") ? (
        <em key={`i-${i}-${j}`} className="italic">
          {p.slice(1, -1)}
        </em>
      ) : (
        p
      )
    );
  });

  return parts;
}

// Build nested lists recursively
function renderList(items, level = 0) {
  if (!items || items.length === 0) return null;

  const Tag = items[0].type === "bullet" ? "ul" : "ol";
  const paddingClass = `pl-${4 + level * 4}`;

  return (
    <Tag className={`mb-4 ${paddingClass} text-white`}>
      {items.map((item, idx) => (
        <li key={idx} className="mb-1 text-white">
          {parseInlineFormatting(item.content)}
          {item.children && item.children.length > 0 && renderList(item.children, level + 1)}
        </li>
      ))}
    </Tag>
  );
}

// Parse description text into formatted React elements
function formatDescription(description) {
  if (!description) return null;

  const lines = description.split(/\r?\n/).map((line) => line.replace(/\t/g, "  ").trimEnd());
  const content = [];
  const rootItems = [];
  const stack = [{ items: rootItems, indent: -1 }];

  lines.forEach((line) => {
    if (!line) return;

    const bulletMatch = /^(\s*)\*\s+(.+)$/.exec(line);
    const numberMatch = /^(\s*)\d+\.\s+(.+)$/.exec(line);

    if (bulletMatch || numberMatch) {
      const indent = (bulletMatch ? bulletMatch[1] : numberMatch[1]).length;
      const type = bulletMatch ? "bullet" : "number";
      const contentText = (bulletMatch ? bulletMatch[2] : numberMatch[2]).trim();

      while (stack.length > 0 && indent <= stack[stack.length - 1].indent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1];
      const newItem = { type, content: contentText, children: [] };
      parent.items.push(newItem);
      stack.push({ items: newItem.children, indent });
      return;
    }

    while (stack.length > 1) stack.pop();

    if (line.startsWith("###")) {
      content.push(
        <h3 key={content.length} className="text-xl font-semibold mt-6 mb-2 text-white">
          {parseInlineFormatting(line.replace(/^###\s*/, ""))}
        </h3>
      );
      return;
    }

    if (line.length < 60 && /^[A-Z]/.test(line) && !/[.,]/.test(line)) {
      content.push(
        <h3 key={content.length} className="text-xl font-semibold mt-4 mb-2 text-white">
          {parseInlineFormatting(line)}
        </h3>
      );
      return;
    }

    content.push(
      <p key={content.length} className="mb-2 text-white">
        {parseInlineFormatting(line)}
      </p>
    );
  });

  if (rootItems.length > 0) content.push(renderList(rootItems));

  return content;
}

export default function EventDescription({ summary, description, htmlContent, location, url, categories }) {
  if (!summary && !description && !htmlContent) return null;

  const content = htmlContent ? (
    <div className="event-description-html text-white" dangerouslySetInnerHTML={{ __html: htmlContent }} />
  ) : (
    <div className="text-white">{formatDescription(description)}</div>
  );

  return (
    <div className="tribe-events-single-event-description tribe-events-content text-white">
      {summary && <h2 className="mb-6 text-3xl font-bold text-white">{summary}</h2>}
      {content}
      {location && <p className="mt-6 italic text-white">📍 {location}</p>}
      {url && (
        <p className="mt-2 text-white">
          <strong>
            The{" "}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-500 font-semibold underline"
            >
              official event page
            </a>
          </strong>
        </p>
      )}
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