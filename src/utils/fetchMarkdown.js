// src/utils/fetchMarkdown.js
import fetch from 'node-fetch';
import matter from 'gray-matter';

export async function fetchMarkdown(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Markdown: ${res.status}`);
  const md = await res.text();

  // Strip unsupported blocks
  const cleanMd = md.replace(/<!-- Unsupported block type: .* -->/g, '');
  
  const { data, content } = matter(cleanMd);
  return { frontmatter: data, content };
}