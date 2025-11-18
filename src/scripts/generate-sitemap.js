import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.yoursite.com'; // Update this
const PUBLIC_DIR = path.join(__dirname, '../../public'); 
const CONTENT_DIR = path.join(__dirname, '../../src/content');

const DEFAULT_CHANGEFREQ = 'weekly';
const DEFAULT_PRIORITY = 0.5;

const folderConfig = {
  'blog': { changefreq: 'daily', priority: 0.8 },
  'projects': { changefreq: 'weekly', priority: 0.7 },
  'projects/space-tech': { changefreq: 'monthly', priority: 0.6 },
};

if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

function collectPages(folderPath, urlPath = '') {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  let pages = [];
  let subfolders = [];

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);
    const relativeUrl = path.join(urlPath, entry.name.replace(/\.(md|html)$/, ''));

    if (entry.isDirectory()) {
      subfolders.push({ path: fullPath, urlPath: path.join(urlPath, entry.name) });
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.html'))) {
      const folderKey = urlPath.replace(/\\/g, '/');
      const config = folderConfig[folderKey] || {};

      const stats = fs.statSync(fullPath);
      const lastmod = stats.mtime.toISOString();

      pages.push({
        loc: `${BASE_URL}/${relativeUrl}`,
        lastmod,
        changefreq: config.changefreq || DEFAULT_CHANGEFREQ,
        priority: config.priority ?? DEFAULT_PRIORITY
      });
    }
  }

  return { pages, subfolders };
}

function generateSitemap(fileName, urls) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(url => `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`).join('\n') +
    `\n</urlset>`;

  fs.writeFileSync(path.join(PUBLIC_DIR, fileName), xml, 'utf8');
  console.log(`✅ Generated sitemap: ${fileName}`);
  return fileName;
}

function processFolder(folderPath, urlPath = '') {
  const { pages, subfolders } = collectPages(folderPath, urlPath);
  const sitemapFiles = [];

  if (pages.length > 0) {
    const fileName = `sitemap-${urlPath ? urlPath.replace(/[\/\\]/g, '-') : 'root'}.xml`;
    sitemapFiles.push(generateSitemap(fileName, pages));
  }

  for (const sub of subfolders) {
    sitemapFiles.push(...processFolder(sub.path, sub.urlPath));
  }

  return sitemapFiles;
}

const sitemapFiles = processFolder(CONTENT_DIR);

const sitemapIndexXML = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  sitemapFiles.map(sm => `  <sitemap>\n    <loc>${BASE_URL}/${sm}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>`).join('\n') +
  `\n</sitemapindex>`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapIndexXML, 'utf8');
console.log('✅ Generated sitemap index: sitemap.xml');