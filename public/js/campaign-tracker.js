// public/js/campaign-tracker.js
(function () {
  const params = new URLSearchParams(window.location.search);
  const utmData = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  let stored = false;

  utmData.forEach(key => {
    const value = params.get(key);
    if (value) {
      localStorage.setItem(key, value);
      stored = true;
    }
  });

  // Optionally store referrer
  if (document.referrer && !localStorage.getItem('referrer')) {
    localStorage.setItem('referrer', document.referrer);
  }

  if (stored) console.log("UTM parameters stored.");
})();