---
import Layout from '../../../layouts/Layout.astro';

const title = "Emergency";
const description = "Monitoring and early warning systems for floods, forest fires, and droughts.";
---

<Layout title={title} description={description}>
  <h1>{title}</h1>
  <p>
    Emergency monitoring focuses on early warning systems and disaster preparedness for floods, forest fires, and droughts.
  </p>

  <h2>Flood Awareness</h2>
  <ul>
    <li>Flood forecasting and modeling</li>
    <li>Early warning and alert systems</li>
    <li>Mapping flood-prone areas and mitigation strategies</li>
  </ul>

  <h2>Forest Fires</h2>
  <ul>
    <li>Fire detection using EO data and satellites</li>
    <li>Risk mapping and prevention strategies</li>
    <li>Monitoring affected regions and recovery efforts</li>
  </ul>

  <h2>Drought</h2>
  <ul>
    <li>Monitoring rainfall and soil moisture</li>
    <li>Early warning and water resource management</li>
    <li>Assessing impact on agriculture and ecosystems</li>
  </ul>
</Layout>