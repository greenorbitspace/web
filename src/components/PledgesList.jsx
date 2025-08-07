import React, { useState, useMemo } from 'react';
import { SDGs } from '../data/sdgs'; // Expected format: [{ id, name, icon, url }, ...]

const fallbackLogo = '/logos/default-placeholder.svg';
const fallbackIcon = '/sdgs/default.svg';

// Create a lookup map for SDG codes (e.g., "SDG 01") to SDG metadata
const sdgMap = SDGs.reduce((acc, sdg) => {
  const sdgCode = `SDG ${String(sdg.id).padStart(2, '0')}`;
  acc[sdgCode.toUpperCase()] = sdg;
  return acc;
}, {});

export default function PledgesList({ pledges = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSDG, setActiveSDG] = useState('All');

  // Extract unique SDG codes from pledges for filter tabs
  const sdgCategories = useMemo(() => {
    const sdgSet = new Set();

    pledges.forEach(({ SDGs }) => {
      if (Array.isArray(SDGs)) {
        SDGs.forEach((sdgNum) => {
          if (typeof sdgNum === 'number') {
            const code = `SDG ${String(sdgNum).padStart(2, '0')}`;
            sdgSet.add(code);
          }
        });
      } else if (typeof SDGs === 'number') {
        const code = `SDG ${String(SDGs).padStart(2, '0')}`;
        sdgSet.add(code);
      } else if (typeof SDGs === 'string') {
        const match = SDGs.match(/SDG\s*\d{2}/i);
        if (match) sdgSet.add(match[0].toUpperCase());
      }
    });

    return ['All', ...Array.from(sdgSet).sort()];
  }, [pledges]);

  // Filter pledges by active SDG and search term
  const filteredPledges = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return pledges.filter((pledge) => {
      let pledgeSDGcodes = [];

      if (Array.isArray(pledge.SDGs)) {
        pledgeSDGcodes = pledge.SDGs
          .filter((sdgNum) => typeof sdgNum === 'number')
          .map((sdgNum) => `SDG ${String(sdgNum).padStart(2, '0')}`);
      } else if (typeof pledge.SDGs === 'number') {
        pledgeSDGcodes = [`SDG ${String(pledge.SDGs).padStart(2, '0')}`];
      } else if (typeof pledge.SDGs === 'string') {
        const match = pledge.SDGs.match(/SDG\s*\d{2}/i);
        if (match) pledgeSDGcodes = [match[0].toUpperCase()];
      }

      const matchesSDG = activeSDG === 'All' || pledgeSDGcodes.includes(activeSDG);

      const searchableText = [
        pledge.name,
        (pledge.values || []).join(' '),
        pledge.how,
        pledge.why,
        pledge.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesSDG && searchableText.includes(term);
    });
  }, [pledges, searchTerm, activeSDG]);

  return (
    <section className="space-y-8" aria-label="Pledges Directory">
      {/* SDG Filter Tabs */}
      <nav
        className="flex flex-wrap gap-2 border-b pb-3 border-gray-300 dark:border-gray-600"
        role="tablist"
        aria-label="Filter pledges by SDG"
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
          placeholder="Search pledges by name, values, how or why..."
          aria-labelledby="pledge-search-heading"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      {/* Pledges List */}
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
              name,
              slug,
              URL,
              logo,
              organisations,
              description, // Added description destructure
              values,
              how,
              why,
              SDGs,
            } = pledge;

            const sdgCodes = Array.isArray(SDGs)
              ? SDGs
                  .filter((sdgNum) => typeof sdgNum === 'number')
                  .map((sdgNum) => `SDG ${String(sdgNum).padStart(2, '0')}`)
              : typeof SDGs === 'number'
              ? [`SDG ${String(SDGs).padStart(2, '0')}`]
              : [];

            return (
              <li
                key={`${name}-${index}`}
                className="border border-accent-500 rounded-lg p-6 bg-white dark:bg-secondary-700 hover:shadow-lg transition"
                role="listitem"
              >
                <article
                  className="flex flex-col h-full"
                  aria-labelledby={`pledge-title-${index}`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={logo || fallbackLogo}
                      alt={`${name} logo`}
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
                      {slug ? (
                        <a href={`/pledges/${slug}`} className="hover:underline">
                          {name}
                        </a>
                      ) : URL ? (
                        <a
                          href={URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {name}
                        </a>
                      ) : (
                        name
                      )}
                    </h3>
                  </div>

                  {description && (
                    <p className="text-sm text-gray-500 dark:text-white mb-2">
                      {description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-auto items-center">
                    {organisations && (
                      <span className="bg-gray-300 dark:bg-accent-500 text-white dark:white rounded-full px-3 py-1 text-xs font-medium capitalize">
                        {organisations}
                      </span>
                    )}

                    {sdgCodes.map((code) => {
                      const sdgData = sdgMap[code];
                      if (!sdgData) return null;

                      const sdgNumber = Number(code.split(' ')[1]);

                      return (
                        <a
                          key={code}
                          href={`https://sdgs.greenorbit.space/${sdgNumber}/`}
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
                      );
                    })}
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