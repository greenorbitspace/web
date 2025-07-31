// public/scripts/transitions.js

export function setupTransitions() {
  // Your transition logic here
  document.addEventListener('astro:page-load', () => {
    document.getElementById('page-wrapper')?.classList.add('page-loaded');
  });
  document.addEventListener('astro:before-swap', () => {
    document.getElementById('page-wrapper')?.classList.remove('page-loaded');
  });
}