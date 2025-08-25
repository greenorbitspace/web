// lighthouse-crawl.js
import Crawler from 'simplecrawler';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import fs from 'fs';

const startUrl = 'https://greenorbit.space';
const maxDepth = 5;
const results = [];
const testedUrls = new Set();

// Configure crawler
const crawler = new Crawler(startUrl);
crawler.maxDepth = maxDepth;
crawler.stripQuerystring = true;
crawler.downloadUnsupported = false;
crawler.maxConcurrency = 5;
crawler.interval = 250;

async function run() {
  // Launch Chrome once
  const chrome = await launch({ chromeFlags: ['--headless', '--no-sandbox'] });
  const options = { port: chrome.port };

  crawler.on('fetchcomplete', async (queueItem) => {
    const url = queueItem.url;

    if (testedUrls.has(url)) return;
    testedUrls.add(url);

    console.log(`Testing ${url}...`);
    try {
      const result = await lighthouse(url, options);
      const lhr = result.lhr;

      results.push({
        url,
        scores: {
          performance: lhr.categories.performance.score,
          accessibility: lhr.categories.accessibility.score,
          bestPractices: lhr.categories['best-practices'].score,
          seo: lhr.categories.seo.score,
          pwa: lhr.categories.pwa.score,
        },
        audits: Object.keys(lhr.audits).reduce((acc, key) => {
          acc[key] = {
            score: lhr.audits[key].score,
            displayValue: lhr.audits[key].displayValue,
          };
          return acc;
        }, {}),
      });
    } catch (err) {
      console.error(`Error testing ${url}:`, err);
    }
  });

  crawler.on('complete', async () => {
    fs.writeFileSync('lighthouse-full-results.json', JSON.stringify(results, null, 2));
    console.log(`Lighthouse crawl complete. ${results.length} pages tested.`);
    console.log('Results saved to lighthouse-full-results.json');
    await chrome.kill();
  });

  crawler.start();
}

run().catch((err) => {
  console.error('Fatal error:', err);
});