#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

const siteUrl = 'https://greenorbit.space';
const pagesGlob = './src/pages/**/*.{astro,md,mdx}';
const distDir = './dist';
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

const isValidRoute = route => !route.includes('[') && !route.includes('404');

(async () => {
  const files = (await glob(pagesGlob)).filter(f => !f.includes('404'));

  const getRoute = file =>
    file
      .replace(/^\.?\/?src\/pages/, '')
      .replace(/\.(astro|md|mdx)$/, '')
      .replace(/\/index$/, '/');

  const getFullUrl = route =>
    `${siteUrl.replace(/\/$/, '')}${route.startsWith('/') ? route : '/' + route}`;

  const sitemapEntries = [];
  const seoEntries = [];

  // Ensure homepage is first
  sitemapEntries.push({
    url: siteUrl,
    lastmod: today,
    priority: '1.0'
  });

  seoEntries.push({
    route: '/',
    title: 'Green Orbit Digital – Sustainable Marketing for the Space Sector',
    description: 'Visit Green Orbit Digital – sustainability meets innovation.',
    canonical: siteUrl,
    priority: '1.0'
  });

  for (const file of files) {
    const route = getRoute(file);
    if (!isValidRoute(route) || route === '/') continue; // skip homepage (already added)

    let lastmod = today;
    let frontTitle = null;
    let frontDescription = null;

    if (file.endsWith('.md') || file.endsWith('.mdx')) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const { data } = matter(content);
        if (data.date) lastmod = new Date(data.date).toISOString().split('T')[0];
        frontTitle = data.title || null;
        frontDescription = data.description || null;
      } catch (err) {
        console.warn(`⚠️ Could not parse frontmatter in ${file}: ${err.message}`);
      }
    }

    const url = getFullUrl(route);

    let priority = '0.5';
    if (route.startsWith('/services')) priority = '0.9';
    else if (route.startsWith('/blog')) priority = '0.7';

    sitemapEntries.push({ url, lastmod, priority });

    seoEntries.push({
      route,
      title: frontTitle || route.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' – Green Orbit Digital',
      description: frontDescription || 'Visit Green Orbit Digital – sustainability meets innovation.',
      canonical: url,
      priority
    });
  }

  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapEntries.map(e =>
      `  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <priority>${e.priority}</priority>
  </url>`
    ),
    '</urlset>'
  ].join('\n');

  fs.mkdirSync(distDir, { recursive: true });

  // BOM-safe write
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), Buffer.from(sitemapXml, 'utf8'));

  fs.writeFileSync(
    path.join(distDir, 'seo.json'),
    JSON.stringify(seoEntries, null, 2),
    'utf8'
  );

  console.log(`✅ Sitemap generated at ${distDir}/sitemap.xml`);
  console.log(`✅ SEO JSON generated at ${distDir}/seo.json`);
})();