// src/scripts/initGA.js
export function initGA() {
  if (typeof window.gtag === 'function') return;

  const GA_ID = "G-411653436";

  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;

  const script2 = document.createElement("script");
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}', { anonymize_ip: true });
  `;

  document.head.appendChild(script1);
  document.head.appendChild(script2);
}