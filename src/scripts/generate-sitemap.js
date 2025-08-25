#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

const siteUrl = 'https://greenorbit.space';
const pagesGlob = './src/pages/**/*.{astro,md,mdx}';
const distDir = './dist';

// Fetch all page files, excluding 404
const files = (await glob(pagesGlob)).filter(f => !f.includes('404'));

// Helper: generate route from file
function getRoute(file) {
  return file
    .replace(/^\.?\/?src\/pages/, '')    // remove ./src/pages or /src/pages at start
    .replace(/\.(astro|md|mdx)$/, '')    // remove file extension
    .replace(/\/index$/, '/');           // convert /index to /
}

// Helper: construct full URL
function getFullUrl(route) {
  return `${siteUrl.replace(/\/$/, '')}${route.startsWith('/') ? route : '/' + route}`;
}

// Collect sitemap entries
const sitemapEntries = [];

for (const file of files) {
  let lastmod = null;

  // Only try reading frontmatter from Markdown/MDX files
  if (file.endsWith('.md') || file.endsWith('.mdx')) {
    const content = fs.readFileSync(file, 'utf-8');
    const { data: frontmatter } = matter(content);
    lastmod = frontmatter.date || null;
  }

  const route = getRoute(file);
  const url = getFullUrl(route);

  // Priority & changefreq logic
  let priority = '0.5';
  let changefreq = 'monthly';

  if (route.startsWith('/services')) { 
    priority = '0.9'; 
    changefreq = 'weekly'; 
  } else if (route.startsWith('/blog')) { 
    priority = '0.7'; 
    changefreq = 'daily'; 
  } else if (route === '/') { 
    priority = '1.0'; 
    changefreq = 'daily'; 
  }

  sitemapEntries.push({ url, lastmod, changefreq, priority });
}

// Build sitemap.xml content
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(e => `  <url>
    <loc>${e.url}</loc>
    ${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

// Write sitemap.xml
fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);

console.log(`✅ Sitemap generated at ${distDir}/sitemap.xml`);