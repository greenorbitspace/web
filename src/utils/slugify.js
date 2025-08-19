// src/utils/slugify.js
export default function slugify(title) {
  if (!title) return '';
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')     
    .replace(/&/g, '-and-')      
    .replace(/[^\w\-]+/g, '')    
    .replace(/\-\-+/g, '-')      
    .replace(/^-+|-+$/g, '');    
}