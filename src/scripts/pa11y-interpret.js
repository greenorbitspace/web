import fs from 'fs';

const results = JSON.parse(fs.readFileSync('pa11y-full-results.json', 'utf-8'));

const weightMap = { error: 3, warning: 2, notice: 1 };
let totalIssues = 0;
let totalPoints = 0;

// Map action → aggregated data
const actionSummary = {};

results.forEach(page => {
  page.issues.forEach(issue => {
    totalIssues++;
    totalPoints += weightMap[issue.type] || 1;

    // Determine action
    let action = 'Consider implementing best practice';
    if (issue.type === 'error') action = 'Fix immediately';
    if (issue.type === 'warning') action = 'Investigate and fix';
    if (issue.code.includes('4_1_3')) {
      action = "Add role='status' or aria-live='polite' to dynamic status messages.";
    }

    // Initialize if not exists
    if (!actionSummary[action]) {
      actionSummary[action] = { count: 0, typeBreakdown: { error:0, warning:0, notice:0 }, affectedUrls: [] };
    }

    actionSummary[action].count++;
    actionSummary[action].typeBreakdown[issue.type] = (actionSummary[action].typeBreakdown[issue.type] || 0) + 1;
    if (!actionSummary[action].affectedUrls.includes(page.url)) {
      actionSummary[action].affectedUrls.push(page.url);
    }
  });
});

// Calculate overall score
const score = Math.max(0, Math.round(100 - (totalPoints / (totalIssues * 3) * 100)));

// Convert summary object to array for reporting
const summary = Object.entries(actionSummary).map(([action, data]) => ({ action, ...data }));

fs.writeFileSync('pa11y-summary-report.json', JSON.stringify({ score, summary }, null, 2));
console.log(`Accessibility score: ${score}%`);
console.log('Summary report saved to pa11y-summary-report.json');