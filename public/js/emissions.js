const emissionFactors = {
  fuel: { petrol: 2.31, diesel: 2.68, naturalGas: 2.05, LPG: 1.51 },
  fleet: 0.21,
  electricity: { UK: 0.233, EU: 0.255, US: 0.4, Global: 0.475 },
  heating: 0.202
};

let chart;

function calculateEmissions() {
  const fuelType = document.getElementById('fuelType').value;
  const fuel = parseFloat(document.getElementById('fuelLitres').value || 0);
  const fleet = parseFloat(document.getElementById('fleetKm').value || 0);
  const region = document.getElementById('region').value;
  const electricity = parseFloat(document.getElementById('electricity').value || 0);
  const heating = parseFloat(document.getElementById('heating').value || 0);

  const scope1 = ((fuel * emissionFactors.fuel[fuelType]) + (fleet * emissionFactors.fleet)) / 1000;
  const scope2 = ((electricity * emissionFactors.electricity[region]) + (heating * emissionFactors.heating)) / 1000;
  const total = scope1 + scope2;

  document.getElementById('scope1Result').innerText = scope1.toFixed(2);
  document.getElementById('scope2Result').innerText = scope2.toFixed(2);
  document.getElementById('totalResult').innerText = total.toFixed(2);

  const ctx = document.getElementById('emissionsChart').getContext('2d');
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Scope 1','Scope 2'],
      datasets: [{ data: [scope1, scope2], backgroundColor: ['#22c55e','#3b82f6'] }]
    },
    options: { responsive: true }
  });
}

async function sendEmailReport() {
  const payload = {
    fuelType: document.getElementById('fuelType').value,
    fuel: document.getElementById('fuelLitres').value,
    fleet: document.getElementById('fleetKm').value,
    region: document.getElementById('region').value,
    electricity: document.getElementById('electricity').value,
    heating: document.getElementById('heating').value,
    scope1: document.getElementById('scope1Result').innerText,
    scope2: document.getElementById('scope2Result').innerText,
    total: document.getElementById('totalResult').innerText,
    email: document.getElementById('email').value
  };

  const response = await fetch('https://YOUR_SERVERLESS_ENDPOINT/send-emissions-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if(response.ok) alert('Report sent!');
  else alert('Error sending report.');
}