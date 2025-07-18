import React, { useEffect, useState } from 'react';

export default function PricingFilters() {
  const [filters, setFilters] = useState({
    type: '',
    interval: '',
    search: '',
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(filters);
    const queryString = urlParams.toString();
    const event = new CustomEvent('filterPlans', { detail: queryString });
    window.dispatchEvent(event);
  }, [filters]);

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
        <select
          id="type"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">All</option>
          <option value="discovery">Discovery & Strategy</option>
          <option value="audits">Audits & Performance</option>
          <option value="reporting">Reporting & Disclosure</option>
          <option value="creative">Creative & Comms</option>
          <option value="workshops">Workshops & Training</option>
          <option value="retainers">Retainers & Support</option>
        </select>
      </div>

      <div>
        <label htmlFor="interval" className="block text-sm font-medium text-gray-700">Billing</label>
        <select
          id="interval"
          value={filters.interval}
          onChange={(e) => setFilters({ ...filters, interval: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">All</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
      </div>

      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
        <input
          id="search"
          type="text"
          placeholder="Search plans..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
    </div>
  );
}