import React from 'react';

// Inline formatting parser: bold, italic, links
function parseInlineFormatting(text) {
  if (!text) return null;

  // Links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  text = text.split(linkRegex).map((part, i) => {
    if (i % 3 === 1) return <span key={`link-text-${i}`}>{part}</span>;
    if (i % 3 === 2) return (
      <a key={`link-url-${i}`} href={part} target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-400">{part}</a>
    );
    return part;
  }).flat();

  // Bold: **text**
  const boldRegex = /\*\*([^\*]+)\*\*/g;
  text = text.map((chunk, i) =>
    typeof chunk === 'string'
      ? chunk.split(boldRegex).map((sub, j) => (j % 2 === 1 ? <strong key={`b-${i}-${j}`}>{sub}</strong> : sub))
      : chunk
  ).flat();

  // Italic: *text*
  const italicRegex = /\*([^\*]+)\*/g;
  text = text.map((chunk, i) =>
    typeof chunk === 'string'
      ? chunk.split(italicRegex).map((sub, j) => (j % 2 === 1 ? <em key={`i-${i}-${j}`}>{sub}</em> : sub))
      : chunk
  ).flat();

  return text;
}

export default function EventDescription({ description }) {
  if (!description) return null;

  const lines = description.split('\n');
  const content = [];
  const headingKeywords = [
    'Scientific Motivation',
    'Venue and Lodging',
    'Main topics or themes covered',
    'Target audience',
    'Event highlights',
    'Keywords'
  ];

  let i = 0;
  while (i < lines.length) {
    let line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }

    // H2: Title (first line)
    if (i === 0) {
      content.push(
        <h2 key={`h2-${i}`} className="text-2xl font-bold mt-4 mb-2 text-white">
          {line}
        </h2>
      );
      i++;
      continue;
    }

    // H3: subheadings
    if (line.endsWith(':') || headingKeywords.includes(line)) {
      content.push(
        <h3 key={`h3-${i}`} className="text-xl font-semibold mt-4 mb-2 text-accent-500">
          {line.replace(/:$/, '')}
        </h3>
      );

      // Collect bullet items or paragraphs under this heading
      const listItems = [];
      let j = i + 1;
      while (j < lines.length && lines[j].trim() && !lines[j].endsWith(':') && !headingKeywords.includes(lines[j].trim())) {
        let nextLine = lines[j].trim();

        // Split multiple dash items on same line
        if (/–/.test(nextLine)) {
          nextLine.split('–').map(s => s.trim()).filter(Boolean).forEach(item => listItems.push(item));
        } else if (/^[-–]/.test(nextLine)) {
          listItems.push(nextLine.replace(/^[-–]\s*/, ''));
        } else {
          // Paragraphs
          if (listItems.length) {
            content.push(
              <ul key={`ul-${j}`} className="list-disc list-inside ml-4 mb-2">
                {listItems.map((item, idx) => <li key={idx}>{parseInlineFormatting(item)}</li>)}
              </ul>
            );
            listItems.length = 0;
          }
          content.push(
            <p key={`p-${j}`} className="mb-2">{parseInlineFormatting(nextLine)}</p>
          );
        }
        j++;
      }

      if (listItems.length) {
        content.push(
          <ul key={`ul-${i}`} className="list-disc list-inside ml-4 mb-2">
            {listItems.map((item, idx) => <li key={idx}>{parseInlineFormatting(item)}</li>)}
          </ul>
        );
      }

      i = j;
      continue;
    }

    // Default paragraph
    content.push(
      <p key={`p-${i}`} className="mb-2">{parseInlineFormatting(line)}</p>
    );
    i++;
  }

  return <div className="text-white prose prose-white max-w-full">{content}</div>;
}