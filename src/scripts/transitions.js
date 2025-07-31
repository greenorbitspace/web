// src/scripts/transitions.js
export default function initTransitions() {
  // Enhanced page transitions on astro page load
  document.addEventListener('astro:page-load', () => {
    // Animate elements with data-animate attribute
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    animatedElements.forEach((element, index) => {
      const animationType = element.getAttribute('data-animate');
      const delay = element.getAttribute('data-delay') ?? index * 100;
      
      element.style.animationDelay = `${delay}ms`;
      
      setTimeout(() => {
        element.classList.add(animationType, 'animated');
      }, 10);
    });
    
    // Parallax effect for elements with data-parallax attribute
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (parallaxElements.length) {
      const handleParallax = () => {
        parallaxElements.forEach(element => {
          const speed = parseFloat(element.getAttribute('data-parallax')) || 0.1;
          const yPos = -(window.scrollY * speed);
          element.style.transform = `translateY(${yPos}px)`;
        });
      };
      window.addEventListener('scroll', handleParallax);
      // Call once to set initial position
      handleParallax();
    }
    
    // Smooth scroll for anchor links to IDs
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
    
    // Add page transition classes based on data-page-transition attribute
    const pageTransitionElements = document.querySelectorAll('[data-page-transition]');
    pageTransitionElements.forEach(element => {
      const transitionType = element.getAttribute('data-page-transition');
      element.classList.add(`transition-${transitionType}`);
    });
  });
  
  // Handle navigation direction to set transitions accordingly
  document.addEventListener('astro:before-preparation', ({ from, to }) => {
    if (from && to) {
      const fromPath = new URL(from).pathname;
      const toPath = new URL(to).pathname;
      const fromDepth = fromPath.split('/').filter(Boolean).length;
      const toDepth = toPath.split('/').filter(Boolean).length;
      
      let navDirection = 'same';
      if (toDepth > fromDepth) navDirection = 'deeper';
      else if (toDepth < fromDepth) navDirection = 'shallower';
      
      localStorage.setItem('navigationDirection', navDirection);
    }
  });
  
  // Apply navigation direction attribute on page load
  document.addEventListener('astro:page-load', () => {
    const navDirection = localStorage.getItem('navigationDirection');
    if (navDirection) {
      document.documentElement.setAttribute('data-navigation', navDirection);
      setTimeout(() => {
        localStorage.removeItem('navigationDirection');
      }, 1000);
    }
  });
}