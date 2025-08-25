// pa11y-crawl.js
import Crawler from 'simplecrawler';
import pa11y from 'pa11y';
import puppeteer from 'puppeteer';
import fs from 'fs';

const startUrl = 'https://greenorbit.space';
const results = [];
const testedUrls = new Set();

// Configure crawler
const crawler = new Crawler(startUrl);
crawler.maxDepth = 5;
crawler.stripQuerystring = true;
crawler.downloadUnsupported = false;
crawler.maxConcurrency = 5;
crawler.interval = 250;

// Launch a single Puppeteer browser
let browser;

(async () => {
  browser = await puppeteer.launch({ headless: true });

  crawler.on('fetchcomplete', async (queueItem) => {
    const url = queueItem.url;

    if (testedUrls.has(url)) return;
    testedUrls.add(url);

    // Only test HTML pages
    if (!url.match(/\/$|\.html?$/)) {
      console.log(`Skipping non-HTML URL: ${url}`);
      return;
    }

    console.log(`Testing ${url}...`);
    try {
      const result = await pa11y(url, {
        standard: 'WCAG2AA',
        includeNotices: true,
        includeWarnings: true,
        timeout: 120000,
        browser, // use shared browser
        page: {
          gotoOptions: { waitUntil: 'domcontentloaded' },
        },
      });

      // Push raw results
      results.push({ url, issues: result.issues });
    } catch (err) {
      console.error(`Error testing ${url}:`, err.message || err);
    }
  });

  crawler.on('complete', async () => {
    console.log(`Accessibility scan complete. ${results.length} pages tested.`);

    // Generate grouped actionable report
    const report = {};

    results.forEach(({ url, issues }) => {
      issues.forEach((issue) => {
        const action = issue.code || 'Other';
        if (!report[action]) report[action] = [];
        report[action].push({
          url,
          type: issue.type,
          message: issue.message,
          selector: issue.selector,
          context: issue.context,
        });
      });
    });

    fs.writeFileSync('pa11y-full-results.json', JSON.stringify(results, null, 2));
    fs.writeFileSync('pa11y-actionable-report.json', JSON.stringify(report, null, 2));

    console.log('Raw results saved to pa11y-full-results.json');
    console.log('Grouped actionable report saved to pa11y-actionable-report.json');

    await browser.close();
  });

  // Start crawling
  crawler.start();
})();