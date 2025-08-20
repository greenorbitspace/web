// utils/normalizeAuthor.js
export function normalizeAuthorForSearch(authorStr) {
  if (!authorStr) return "";
  return authorStr
    .split(/\s+and\s+/)
    .map(a => a.trim().replace(/\./g, '').toLowerCase()) // remove periods & lowercase
    .join(" ");
}