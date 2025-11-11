import React, { useState, useMemo } from 'react';

const fallbackLogo = '/logos/default-placeholder.svg';

export default function OrganisationsList({ organisations = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Extract all unique categories
  const categories = useMemo(() => {
    const catSet = new Set();
    organisations.forEach((org) => {
      if (org.category) {
        catSet.add(org.category.trim().toLowerCase());
      }
    });
    return ['all', ...Array.from(catSet).sort()];
  }, [organisations]);

  // Filtered results
  const filteredOrganisations = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return organisations.filter((org) => {
      const category = org.category?.trim().toLowerCase() || '';
      const industry = org.industry?.toLowerCase() || '';
      const name = org.organisation?.toLowerCase() || '';
      const description = org.description?.toLowerCase() || '';

      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const matchesSearch =
        name.includes(term) || description.includes(term) || industry.includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeCategory, organisations]);

  return (
    <section className="space-y-8" aria-label="Organisation Directory">
      {/* Category Navigation */}
      <nav
        className="flex flex-wrap gap-2 border-b pb-3 border-gray-300 dark:border-gray-600"
        role="tablist"
        aria-label="Filter by category"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
              activeCategory === cat
                ? 'bg-accent-500 text-white shadow'
                : 'text-gray-700 dark:text-gray-200 hover:bg-accent-500 dark:hover:bg-accent-500'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </nav>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold" id="org-search-heading">
          Organisations
        </h2>
        <input
          type="search"
          placeholder="Search by name, description, or industry..."
          aria-labelledby="org-search-heading"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      {/* Results Grid */}
      <ul
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {filteredOrganisations.length === 0 ? (
          <li className="italic text-accent-500" role="alert">
            No organisations found.
          </li>
        ) : (
          filteredOrganisations.map((org, index) => {
            const {
              slug,
              organisation: name,
              description,
              category,
              industry,
              logo,
            } = org;

            const logoSrc = logo || fallbackLogo;

            return (
              <li
                key={`${slug}-${index}`}
                className="text-primary-500 rounded-lg p-6 bg-white dark:bg-white hover:shadow-lg transition"
                role="listitem"
              >
                <article className="flex flex-col h-full" aria-labelledby={`org-title-${index}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={logoSrc}
                      alt={`${name} logo`}
                      className="w-16 h-16 object-contain flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackLogo;
                      }}
                    />
                    <h3
                      id={`org-title-${index}`}
                      className="text-xl font-semibold text-primary-500"
                      tabIndex={0}
                    >
                      <a
                        href={`/organisations/${slug}`}
                        className="hover:underline focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-sm"
                      >
                        {name}
                      </a>
                    </h3>
                  </div>

                  {description && (
                    <p className="text-gray-700 dark:text-black text-base leading-relaxed mb-3">
                      {description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {industry && (
                      <span className="bg-gray-200 dark:bg-accent-500 text-gray-800 dark:text-white rounded-full px-3 py-1 text-xs font-medium">
                        {industry}
                      </span>
                    )}
                    {category && (
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full px-3 py-1 text-xs font-medium capitalize">
                        {category}
                      </span>
                    )}
                  </div>
                </article>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}