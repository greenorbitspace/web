let allPlans = [];
let currentPage = 1;
const pageSize = 5;

async function loadPlans() {
  try {
    const res = await fetch('/api/stripe-pricing');
    if (!res.ok) throw new Error(res.statusText);
    allPlans = await res.json();
    render();
  } catch (err) {
    console.error('Error fetching plans:', err);
    document.getElementById('plans').innerHTML = '<tr><td colspan="6">Failed to load plans.</td></tr>';
  }
}

function paginate(plans) {
  const start = (currentPage - 1) * pageSize;
  return plans.slice(start, start + pageSize);
}

function formatPrice(price) {
  return price?.unit_amount ? `£${(price.unit_amount / 100).toFixed(2)}` : 'Contact Us';
}

function renderTable(plans) {
  const container = document.getElementById('plans');
  container.innerHTML = '';

  if (plans.length === 0) {
    container.innerHTML = '<tr><td colspan="6" class="p-4 text-center">No plans match your filters.</td></tr>';
    return;
  }

  for (const plan of plans) {
    const features = (plan.product.metadata.features || '')
      .split(',')
      .map(f => f.trim())
      .filter(Boolean)
      .map(f => `<li>${f}</li>`)
      .join('');

    const row = `
      <tr class="border-t">
        <td class="p-2">${plan.product.name}</td>
        <td class="p-2">${plan.product.description}</td>
        <td class="p-2">${formatPrice(plan)}</td>
        <td class="p-2">${plan.recurring ? plan.recurring.interval : 'One-time'}</td>
        <td class="p-2"><ul class="list-disc ml-4">${features}</ul></td>
        <td class="p-2 text-center">
          <a href="/checkout?price_id=${plan.id}" class="btn">Select</a>
        </td>
      </tr>
    `;

    container.innerHTML += row;
  }
}

function updatePaginationControls(totalFiltered) {
  const totalPages = Math.ceil(totalFiltered / pageSize);
  const status = document.getElementById('paginationStatus');
  if (status) status.textContent = `Page ${currentPage} of ${totalPages}`;

  document.getElementById('prevPage').disabled = currentPage <= 1;
  document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

function applyFilters() {
  const form = document.getElementById('filter-form');
  if (!form) return allPlans;

  const industry = form.industry?.value || '';
  const serviceLevel = form.service_level?.value || '';

  return allPlans.filter(plan => {
    const meta = plan.product.metadata || {};
    return (!industry || meta.industry === industry) &&
           (!serviceLevel || meta.service_level === serviceLevel);
  });
}

function render() {
  const filteredPlans = applyFilters();
  const paginated = paginate(filteredPlans);
  renderTable(paginated);
  updatePaginationControls(filteredPlans.length);
}

document.addEventListener('DOMContentLoaded', () => {
  loadPlans();

  const form = document.getElementById('filter-form');
  if (form) {
    form.addEventListener('change', () => {
      currentPage = 1;
      render();
    });
  }

  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      render();
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    render();
  });
});