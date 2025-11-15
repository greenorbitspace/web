import React from 'react';

export default function parseInlineFormatting(text) {
  if (!text) return null;

  let parts = [text];

  // 1️⃣ Images ![alt](url "title")
  parts = parts.flatMap((part, i) => {
    if (typeof part !== 'string') return part;
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

  // 2️⃣ Links [text](url "title")
  parts = parts.flatMap((part, i) => {
    if (typeof part !== 'string') return part;
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

  // 3️⃣ Bold **text**
  parts = parts.flatMap((part, i) => {
    if (typeof part !== 'string') return part;
    return part.split(/(\*\*.*?\*\*)/g).map((p, j) =>
      p.startsWith('**') && p.endsWith('**') ? (
        <strong key={`b-${i}-${j}`} className="font-bold">
          {p.slice(2, -2)}
        </strong>
      ) : (
        p
      )
    );
  });

  // 4️⃣ Italic *text*
  parts = parts.flatMap((part, i) => {
    if (typeof part !== 'string') return part;
    return part.split(/(\*.*?\*)/g).map((p, j) =>
      p.startsWith('*') && p.endsWith('*') ? (
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

// ✅ Recursive renderer for nested lists
export function renderList(items, level = 0) {
  if (!items || !items.length) return null;
  const Tag = items[0].type === 'bullet' ? 'ul' : 'ol';
  const paddingClass = `pl-${4 + level * 4}`;

  return (
    <Tag className={`mb-4 ${paddingClass} list-disc text-white`}>
      {items.map((item, idx) => (
        <li key={idx} className="mb-1">
          {parseInlineFormatting(item.content)}
          {item.children && item.children.length > 0 && renderList(item.children, level + 1)}
        </li>
      ))}
    </Tag>
  );
}