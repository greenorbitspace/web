import React, { useState, useMemo } from 'react';
import servicesData from '../data/pricing.json';

export default function ServicesCatalogue() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  // Ensure each service has a slug
  const services = useMemo(() => {
    return servicesData.map(service => {
      if (!service.slug) {
        return {
          ...service,
          slug: service.product_name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
        };
      }
      return service;
    });
  }, []);

  // Unique categories
  const categories = useMemo(
    () => [...new Set(services.map(s => s.category || 'Other'))],
    [services]
  );

  // Filtered services based on search term & category
  const filteredServices = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return services.filter(service => {
      const matchesSearch =
        service.product_name.toLowerCase().includes(term) ||
        (service.description || '').toLowerCase().includes(term) ||
        (service.summary || '').toLowerCase().includes(term);
      const matchesCategory = !activeCategory || service.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, services]);

  // Format pricing
  function formatCurrency(amount, currency) {
    return (amount / 100).toLocaleString('en-GB', { style: 'currency', currency });
  }

  // Short description for catalogue cards
  function getCardDescription(service) {
    return service.summary || (service.description?.slice(0, 120) + '…') || 'No description available';
  }

  return (
    <section className="space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-white">Service Catalogue</h2>
        <input
          type="search"
          placeholder="Search services..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      {/* Category Filter */}
      <nav className="flex flex-wrap gap-2 border-b pb-3 border-accent-500 dark:border-accent-500">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
            activeCategory === null
              ? 'bg-accent-600 text-white shadow'
              : 'text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700'
          }`}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
              activeCategory === cat
                ? 'bg-accent-500 text-white shadow'
                : 'text-gray-700 dark:text-white hover:bg-accent-100 dark:hover:bg-accent-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Services Grid */}
      <ul className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.length === 0 ? (
          <li className="italic text-accent-500">No services found.</li>
        ) : (
          filteredServices.map((service, idx) => (
            <li
              key={idx}
              className="border border-accent-500 rounded-lg bg-white dark:bg-primary-500 hover:shadow-lg transition"
            >
              <a
                href={`/service-catalogue/${service.slug}`}
                className="block h-full p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {service.product_name}
                </h3>
                <p className="text-gray-700 dark:text-white text-sm mb-4">
                  {getCardDescription(service)}
                </p>
                <div className="space-y-1 mb-2">
                  {(service.prices || []).map((p, i) => (
                    <div key={i} className="text-sm">
                      <strong>{p.client_type}:</strong> {formatCurrency(p.unit_amount, p.currency)}
                    </div>
                  ))}
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-secondary-100 dark:bg-accent-500 text-secondary-600 dark:text-white text-xs font-medium">
                  {service.category}
                </span>
              </a>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}