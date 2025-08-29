import React, { useState, useMemo } from 'react';
import { SDGs } from '../data/sdgs';

const fallbackLogo = '/logos/default-placeholder.svg';
const fallbackIcon = '/sdgs/default.svg';

// Map SDG codes to metadata
const sdgMap = SDGs.reduce((acc, sdg) => {
  const sdgCode = `SDG ${String(sdg.id).padStart(2, '0')}`;
  acc[sdgCode.toUpperCase()] = sdg;
  return acc;
}, {});

export default function PledgesList({ pledges = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSDG, setActiveSDG] = useState('All');
  const [activeOrg, setActiveOrg] = useState('All');

  const toggleFilter = (current, value, setter) =>
    setter(current === value ? 'All' : value);

  // Extract unique SDG codes for filter tabs
  const sdgCategories = useMemo(() => {
    const sdgSet = new Set();
    pledges.forEach(({ SDGs }) => {
      if (Array.isArray(SDGs)) SDGs.forEach(n => typeof n === 'number' && sdgSet.add(`SDG ${String(n).padStart(2, '0')}`));
      else if (typeof SDGs === 'number') sdgSet.add(`SDG ${String(SDGs).padStart(2, '0')}`);
      else if (typeof SDGs === 'string') {
        const match = SDGs.match(/SDG\s*\d{2}/i);
        if (match) sdgSet.add(match[0].toUpperCase());
      }
    });
    return ['All', ...Array.from(sdgSet).sort()];
  }, [pledges]);

  // Filter pledges based on SDG, organisation, and search term
  const filteredPledges = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return pledges.filter((pledge) => {
      let pledgeSDGcodes = [];
      if (Array.isArray(pledge.SDGs)) pledgeSDGcodes = pledge.SDGs.filter(n => typeof n === 'number').map(n => `SDG ${String(n).padStart(2, '0')}`);
      else if (typeof pledge.SDGs === 'number') pledgeSDGcodes = [`SDG ${String(pledge.SDGs).padStart(2, '0')}`];
      else if (typeof pledge.SDGs === 'string') {
        const match = pledge.SDGs.match(/SDG\s*\d{2}/i);
        if (match) pledgeSDGcodes = [match[0].toUpperCase()];
      }

      const matchesSDG = activeSDG === 'All' || pledgeSDGcodes.includes(activeSDG);
      const matchesOrg =
        activeOrg === 'All' ||
        (pledge.organisations &&
          pledge.organisations.toLowerCase() === activeOrg.toLowerCase());

      const searchableText = [pledge.name, (pledge.values || []).join(' '), pledge.how, pledge.why, pledge.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesSDG && matchesOrg && searchableText.includes(term);
    });
  }, [pledges, searchTerm, activeSDG, activeOrg]);

  return (
    <section className="space-y-8" aria-label="Pledges Directory">
      {/* SDG Filter Tabs */}
      <nav className="flex flex-wrap gap-2 border-b pb-3 border-gray-300 dark:border-gray-600">
        {sdgCategories.map((code) => {
          const sdg = sdgMap[code];
          return (
            <button
              key={code}
              onClick={() => toggleFilter(activeSDG, code, setActiveSDG)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md transition ${
                activeSDG === code
                  ? 'bg-accent-600 text-white shadow'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700'
              }`}
            >
              {code !== 'All' && <img src={sdg?.icon || fallbackIcon} alt={sdg?.name || code} className="w-8 h-8 rounded-sm border border-gray-300 dark:border-gray-600" />}
              <span>{code === 'All' ? 'All SDGs' : <span className="sr-only">{sdg?.name}</span>}</span>
            </button>
          );
        })}
      </nav>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Our Pledges</h2>
        <input
          type="search"
          placeholder="Search pledges by name, values, how or why..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      {/* Pledge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredPledges.length === 0 ? (
          <p className="italic text-accent-500">No pledges found.</p>
        ) : filteredPledges.map((pledge, i) => {
            const { name, slug, URL, logo, organisations, description, SDGs } = pledge;
            const sdgCodes = Array.isArray(SDGs) ? SDGs.filter(n => typeof n === 'number').map(n => `SDG ${String(n).padStart(2, '0')}`) : typeof SDGs === 'number' ? [`SDG ${String(SDGs).padStart(2, '0')}`] : [];

            return (
              <div key={i} className="border rounded-lg p-4 shadow-sm flex flex-col h-full bg-white hover:shadow-lg transition">
                {logo && (
                  <img
                    src={logo}
                    alt={`${name} logo`}
                    className="w-full h-32 object-contain rounded mb-4"
                    onError={e => { e.target.onerror = null; e.target.src = fallbackLogo; }}
                  />
                )}

                <h3 className="text-lg font-semibold mb-1 text-primary-500">
                  {slug ? (
                    <a href={`/pledges/${slug}`} className="hover:underline">{name}</a>
                  ) : URL ? (
                    <a href={URL} target="_blank" rel="noopener noreferrer" className="hover:underline">{name}</a>
                  ) : (
                    name
                  )}
                </h3>

                {description && <p className="text-sm text-gray-500 mb-2">{description}</p>}

                {/* Clickable Organisation Tags */}
                {organisations && organisations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {organisations.map((org) => (
                      <span
                        key={org}
                        className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded cursor-pointer"
                        onClick={() => toggleFilter(activeOrg, org.toLowerCase(), setActiveOrg)}
                      >
                        {org}
                      </span>
                    ))}
                  </div>
                )}

                {/* SDG Icons */}
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {sdgCodes.map(code => {
                    const sdg = sdgMap[code];
                    if (!sdg) return null;
                    return (
                      <img
                        key={code}
                        src={sdg.icon || fallbackIcon}
                        alt={sdg.name}
                        className="w-6 h-6 rounded-sm cursor-pointer border border-gray-300"
                        onClick={() => toggleFilter(activeSDG, code, setActiveSDG)}
                      />
                    );
                  })}
                </div>

                {URL && (
                  <a
                    href={URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-block px-4 py-2 bg-accent-500 text-white rounded hover:bg-accent-600"
                  >
                    View Pledge
                  </a>
                )}
              </div>
            );
        })}
      </div>
    </section>
  );
}