const ctx = document.getElementById('emissionsChart').getContext('2d');
if(chart) chart.destroy();
chart = new Chart(ctx, {
  type: 'doughnut',
  data: { labels: ['Scope 1','Scope 2'], datasets: [{ data: [scope1, scope2], backgroundColor: ['#22c55e','#3b82f6'] }] },
  options: { responsive: true }
});