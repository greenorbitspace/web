import fs from 'fs';
import path from 'path';

// Path to JSON file
const jsonFile = path.resolve('./space-apps.json');

// Directory to save Markdown files
const outputDir = path.resolve('./src/content/space-applications');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Load JSON data
const data = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));

// Function to sanitize filenames
function sanitizeFilename(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}

// Generate Markdown files
data.forEach((entry) => {
  const filename = sanitizeFilename(entry.Name) + '.md';
  const filePath = path.join(outputDir, filename);

  const frontmatter = `---
title: "${entry.Name}"
markets: "${entry.Markets || ''}"
description: >
  ${entry.Description.replace(/\n/g, ' ')}
domains: "${entry.Domains || ''}"
copernicus: "${entry.Copernicus || 'No'}"
EGNSS: "${entry.EGNSS || 'No'}"
SDGs:
${(entry.SDGs || []).map((s) => `  - ${s}`).join('\n')}
---
`;

  fs.writeFileSync(filePath, frontmatter, 'utf-8');
  console.log(`Created: ${filePath}`);
});