import React, { useState, useMemo } from 'react';
import { SDGs } from '../data/sdgs';

const SDG_COLORS = {
  'no-poverty': '#E5243B',
  'zero-hunger': '#DDA63A',
  'good-health': '#4C9F38',
  'quality-education': '#C5192D',
  'gender-equality': '#FF3A21',
  'clean-water': '#26BDE2',
  'affordable-clean-energy': '#FCC30B',
  'decent-work': '#A21942',
  'industry-innovation': '#FD6925',
  'reduced-inequalities': '#DD1367',
  'sustainable-cities': '#FD9D24',
  'responsible-consumption': '#BF8B2E',
  'climate-action': '#3F7E44',
  'life-below-water': '#0A97D9',
  'life-on-land': '#56C02B',
  'peace-justice': '#00689D',
  'partnerships': '#19486A',
};
const fallbackColor = '#666';
const CATEGORIES = ['All', ...SDGs.map(sdg => sdg.id.toString())];

function SDGBadge({ slug, name }) {
  const bgColor = SDG_COLORS[slug] || fallbackColor;
  return (
    <span
      style={{ backgroundColor: bgColor }}
      className="inline-block text-white px-3 py-1 rounded font-semibold text-sm select-none"
      aria-label={`SDG color badge for ${name}`}
      role="img"
      aria-hidden="false"
    >
      #{slug.replace(/-/g, ' ')}
    </span>
  );
}

export default function SDGsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredSDGs = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return SDGs.filter(({ name, description, id }) => {
      const matchesCategory = activeCategory === 'All' || id.toString() === activeCategory;
      const matchesSearch =
        name.toLowerCase().includes(term) || description.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeCategory]);

  return (
    <section className="space-y-6" aria-label="Sustainable Development Goals List">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Filter Sustainable Development Goals">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded font-semibold transition ${
              activeCategory === cat
                ? 'bg-accent-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-accent-400'
            }`}
            aria-pressed={activeCategory === cat}
            role="tab"
            tabIndex={activeCategory === cat ? 0 : -1}
          >
            {cat === 'All' ? 'All' : `#${cat}`}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 id="sdg-heading" className="text-3xl font-bold">
          Sustainable Development Goals
        </h2>
        <input
          type="search"
          aria-labelledby="sdg-heading"
          placeholder="Search SDGs..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
          aria-label="Search Sustainable Development Goals"
          role="search"
        />
      </div>

      {/* SDG Cards Grid */}
      <ul
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {filteredSDGs.length === 0 ? (
          <li className="italic text-accent-500" role="alert">
            No SDGs found.
          </li>
        ) : (
          filteredSDGs.map(({ id, name, description, slug, icon }) => {
            const bgColor = SDG_COLORS[slug] || fallbackColor;
            return (
              <li
                key={id}
                className="border border-accent-500 rounded-lg p-6 bg-white dark:bg-secondary-700 hover:shadow-lg transition"
                role="listitem"
              >
                <article
                  aria-labelledby={`sdg-title-${id}`}
                  aria-describedby={`sdg-desc-${id}`}
                  className="flex flex-col h-full"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={icon}
                      alt={`${name} icon`}
                      className="w-14 h-14 flex-shrink-0"
                      loading="lazy"
                      decoding="async"
                    />
                    <h3
                      id={`sdg-title-${id}`}
                      className="text-2xl font-semibold text-accent-600"
                      tabIndex={0}
                    >
                      {name}
                    </h3>
                  </div>
                  <p id={`sdg-desc-${id}`} className="flex-grow text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                    {description}
                  </p>
                  <footer className="mt-6">
                    <SDGBadge slug={slug} name={name} />
                  </footer>
                </article>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}