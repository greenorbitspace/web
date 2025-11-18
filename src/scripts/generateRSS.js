import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import RSS from 'rss';
import yaml from 'js-yaml';

const BASE_URL = 'https://greenorbit.space';
const CONTENT_DIR = path.join(process.cwd(), 'src/content');
const COLLECTIONS = ['blog', 'news', 'press-releases'];
const OUTPUT_DIR = path.join(process.cwd(), '../../public'); // Adjust if needed

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Create RSS feed
const feed = new RSS({
  title: 'Green Orbit Digital Updates',
  description: 'Latest blog posts, news, and press releases from Green Orbit Digital',
  feed_url: `${BASE_URL}/rss.xml`,
  site_url: BASE_URL,
  language: 'en',
  ttl: 60,
});

const today = new Date();

(async function generateRSS() {
  for (const collection of COLLECTIONS) {
    const pattern = `${CONTENT_DIR}/${collection}/**/*.{md,mdx,json}`;
    const files = await glob(pattern);

    console.log(`Found ${files.length} files in ${collection}`);

    for (const filePath of files) {
      try {
        const ext = path.extname(filePath);
        let post;

        if (ext === '.json') {
          post = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } else {
          const content = fs.readFileSync(filePath, 'utf-8');
          const match = content.match(/---\n([\s\S]+?)\n---/);
          if (!match) {
            console.warn(`No frontmatter found in ${filePath}`);
            continue;
          }
          post = yaml.load(match[1]);
        }

        const pubdate = post.pubdate ? new Date(post.pubdate) : today;
        if (pubdate > today) {
          console.log(`Skipping future post: ${post.title}`);
          continue;
        }

        const slug = post.slug ?? post.title?.toLowerCase().replace(/\s+/g, '-');
        const url = post.url ?? `${BASE_URL}/${collection}/${slug}`;

        feed.item({
          title: post.title,
          description: post.excerpt ?? post.description ?? '',
          url,
          guid: url,
          author: post.author ?? 'Green Orbit Digital',
          date: pubdate,
          categories: [...(post.categories ?? [collection]), ...(post.tags ?? [])],
        });

        console.log(`Added post: ${post.title} (${url})`);
      } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
      }
    }
  }

  const outputFile = path.join(OUTPUT_DIR, 'rss.xml');
  fs.writeFileSync(outputFile, feed.xml({ indent: true }));
  console.log(`\n✅ RSS feed generated at ${outputFile}`);
})();