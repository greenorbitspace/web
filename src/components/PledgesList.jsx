import React, { useState, useMemo } from 'react';
import { SDGs } from '../data/sdgs'; // Assumed format: { id, name, icon, url }

const fallbackLogo = '/logos/default-placeholder.svg';
const fallbackIcon = '/sdgs/default.svg';

// Build quick-lookup map from SDG code (e.g. "SDG 01") to SDG metadata
const sdgMap = SDGs.reduce((acc, sdg) => {
  const sdgCode = `SDG ${String(sdg.id).padStart(2, '0')}`;
  acc[sdgCode.toUpperCase()] = sdg;
  return acc;
}, {});

export default function PledgesList({ pledges = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSDG, setActiveSDG] = useState('All');

  // Extract all unique SDG codes from pledges
  const sdgCategories = useMemo(() => {
    const sdgSet = new Set();
    pledges.forEach(({ SDGs }) => {
      const match = SDGs?.match(/SDG\s*\d{2}/i);
      if (match) sdgSet.add(match[0].toUpperCase());
    });
    return ['All', ...Array.from(sdgSet).sort()];
  }, [pledges]);

  const filteredPledges = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return pledges.filter((pledge) => {
      const sdgMatch = pledge.SDGs?.match(/SDG\s*\d{2}/i);
      const pledgeSDG = sdgMatch ? sdgMatch[0].toUpperCase() : null;

      const matchesSDG = activeSDG === 'All' || pledgeSDG === activeSDG;

      const searchableText = [
        pledge.Name,
        pledge['Core Values'],
        pledge['How We Support It'],
        pledge['Why We Support It'],
        pledge.Description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesSDG && searchableText.includes(term);
    });
  }, [pledges, searchTerm, activeSDG]);

  return (
    <section className="space-y-8" aria-label="Pledges Directory">
      {/* Filter Tabs */}
      <nav
        className="flex flex-wrap gap-2 border-b pb-3 border-gray-300 dark:border-gray-600"
        role="tablist"
        aria-label="Filter by SDG"
      >
        <button
          key="All"
          role="tab"
          aria-selected={activeSDG === 'All'}
          onClick={() => setActiveSDG('All')}
          className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
            activeSDG === 'All'
              ? 'bg-accent-600 text-white shadow'
              : 'text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700'
          }`}
        >
          All SDGs
        </button>

        {sdgCategories
          .filter((sdgCode) => sdgCode !== 'All')
          .map((sdgCode) => {
            const sdg = sdgMap[sdgCode];
            return (
              <button
                key={sdgCode}
                role="tab"
                aria-selected={activeSDG === sdgCode}
                onClick={() => setActiveSDG(sdgCode)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md transition ${
                  activeSDG === sdgCode
                    ? 'bg-accent-600 text-white shadow'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700'
                }`}
              >
                <img
                  src={sdg?.icon || fallbackIcon}
                  alt={sdg?.name || sdgCode}
                  className="w-10 h-10 rounded-sm border border-gray-300 dark:border-gray-600"
                />
                <span className="sr-only">{sdg?.name}</span>
              </button>
            );
          })}
      </nav>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold" id="pledge-search-heading">
          Our Pledges
        </h2>
        <input
          type="search"
          placeholder="Search pledges by name, values, or reason..."
          aria-labelledby="pledge-search-heading"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      {/* Pledge Cards */}
      <ul
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {filteredPledges.length === 0 ? (
          <li className="italic text-accent-500" role="alert">
            No pledges found.
          </li>
        ) : (
          filteredPledges.map((pledge, index) => {
            const {
              Name,
              URL,
              logo,
              Category,
              'Core Values': coreValues,
              'How We Support It': howWeSupport,
              'Why We Support It': whyWeSupport,
              SDGs: SDGString,
            } = pledge;

            const sdgMatch = SDGString?.match(/SDG\s*\d{2}/i);
            const sdgCode = sdgMatch ? sdgMatch[0].toUpperCase() : null;
            const sdgData = sdgCode ? sdgMap[sdgCode] : null;

            return (
              <li
                key={`${Name}-${index}`}
                className="border border-accent-500 rounded-lg p-6 bg-white dark:bg-secondary-700 hover:shadow-lg transition"
                role="listitem"
              >
                <article className="flex flex-col h-full" aria-labelledby={`pledge-title-${index}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={logo || fallbackLogo}
                      alt={`${Name} logo`}
                      className="w-16 h-16 object-contain flex-shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackLogo;
                      }}
                    />
                    <h3
                      id={`pledge-title-${index}`}
                      className="text-xl font-semibold text-accent-600"
                      tabIndex={0}
                    >
                      {URL ? (
                        <a
                          href={URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {Name}
                        </a>
                      ) : (
                        Name
                      )}
                    </h3>
                  </div>

                  {coreValues && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <strong>Core Values:</strong> {coreValues}
                    </p>
                  )}

                  {howWeSupport && (
                    <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-2">
                      <strong>How we support it:</strong> {howWeSupport}
                    </p>
                  )}

                  {whyWeSupport && (
                    <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-3">
                      <strong>Why we support it:</strong> {whyWeSupport}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-auto items-center">
                    {Category && (
                      <span className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full px-3 py-1 text-xs font-medium capitalize">
                        {Category}
                      </span>
                    )}

                    {sdgData && (
                      <a
                        href={sdgData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative"
                        aria-label={`View details about ${sdgData.name}`}
                      >
                        <img
                          src={sdgData.icon}
                          alt={sdgData.name}
                          className="w-8 h-8 rounded-sm border border-gray-300 dark:border-gray-600"
                        />
                        <span className="sr-only">{sdgData.name}</span>
                      </a>
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