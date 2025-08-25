#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

const siteUrl = 'https://greenorbit.space';
const pagesGlob = './src/pages/**/*.{astro,md,mdx}';
const distDir = './dist';

(async () => {
  // Fetch all page files, excluding 404
  const files = (await glob(pagesGlob)).filter(f => !f.includes('404'));

  // Helper: generate route from file
  function getRoute(file) {
    return file
      .replace(/^\.?\/?src\/pages/, '')    
      .replace(/\.(astro|md|mdx)$/, '')    
      .replace(/\/index$/, '/');           
  }

  // Helper: construct full URL
  function getFullUrl(route) {
    return `${siteUrl.replace(/\/$/, '')}${route.startsWith('/') ? route : '/' + route}`;
  }

  const sitemapEntries = [];
  const seoEntries = [];

  for (const file of files) {
    let lastmod = null;
    let frontTitle = null;
    let frontDescription = null;

    if (file.endsWith('.md') || file.endsWith('.mdx')) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const { data: frontmatter } = matter(content);
        lastmod = frontmatter.date || null;
        frontTitle = frontmatter.title || null;
        frontDescription = frontmatter.description || null;
      } catch (err) {
        console.warn(`⚠️ Could not parse frontmatter in ${file}: ${err.message}`);
      }
    }

    const route = getRoute(file);
    const url = getFullUrl(route);

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

    seoEntries.push({
      route,
      title: frontTitle || 
        (route === '/' 
          ? 'Green Orbit Digital – Sustainable Marketing for the Space Sector' 
          : route.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' – Green Orbit Digital'),
      description: frontDescription || 'Visit Green Orbit Digital – sustainability meets innovation.',
      canonical: url,
      changefreq,
      priority
    });
  }

  // Write sitemap.xml
const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
]
  .concat(
    sitemapEntries.map(e => {
      return `  <url>
    <loc>${e.url}</loc>
    ${e.lastmod ? `<lastmod>${new Date(e.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`;
    })
  )
  .concat('</urlset>')
  .join('\n');

// Write files
fs.mkdirSync(distDir, { recursive: true });
// Ensure UTF-8 without BOM
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, { encoding: 'utf8', flag: 'w' });
fs.writeFileSync(path.join(distDir, 'seo.json'), JSON.stringify(seoEntries, null, 2));

console.log(`✅ Sitemap generated at ${distDir}/sitemap.xml`);
console.log(`✅ SEO JSON generated at ${distDir}/seo.json`);
})();