// createEarthPages.js
import fs from 'fs';
import path from 'path';

const baseDir = './src'; // Change if your src folder is elsewhere

// Define folder structure and files
const structure = {
  'content/earth': {
    environment: ['atmosphere.md', 'ocean.md', 'land.md'],
    climate: [
      'temperature.md',
      'precipitation.md',
      'greenhouse-gases.md',
      'cryosphere.md',
      'carbon-cycle.md',
      'renewable-energy.md',
      'climate-risk.md',
    ],
    security: ['index.md'],
    emergency: ['index.md'],
  },
  'pages/earth': {
    '': ['index.astro'],
    environment: ['atmosphere.astro', 'ocean.astro', 'land.astro'],
    climate: [
      'index.astro',
      'temperature.astro',
      'precipitation.astro',
      'greenhouse-gases.astro',
      'cryosphere.astro',
      'carbon-cycle.astro',
      'renewable-energy.astro',
      'climate-risk.astro',
    ],
    security: ['index.astro'],
    emergency: ['index.astro'],
  },
  'components/charts': ['Co2LineChart.astro', 'TemperatureAnomaly.astro', 'SeaLevelRise.astro'],
  layouts: ['Layout.astro'],
};

// Helper to create folders and files
function createStructure(base, obj) {
  for (const folder in obj) {
    const folderPath = path.join(base, folder);
    fs.mkdirSync(folderPath, { recursive: true });

    const files = obj[folder];
    if (Array.isArray(files)) {
      files.forEach((file) => {
        const filePath = path.join(folderPath, file);
        if (!fs.existsSync(filePath)) {
          const ext = path.extname(file);
          const name = path.basename(file, ext);

          let content = '';

          if (ext === '.md') {
            content = `---
title: "${name.replace(/-/g, ' ')}"
slug: "/earth/${folder.replace(/\\/g, '/')}/${name}"
description: "Content for ${name.replace(/-/g, ' ')}."
---

# ${name.replace(/-/g, ' ')}

Content goes here.
`;
          } else if (ext === '.astro') {
            content = `---
title: "${name.replace(/-/g, ' ')}"
description: "Page/component for ${name.replace(/-/g, ' ')}."
---

<!-- Add content or component here -->`;
          }

          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Created ${filePath}`);
        }
      });
    } else {
      createStructure(folderPath, files);
    }
  }
}

// Run
createStructure(baseDir, structure);
console.log('Earth content/pages/components structure created!');