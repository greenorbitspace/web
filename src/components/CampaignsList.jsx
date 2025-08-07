import React, { useState, useMemo } from 'react';
import { SDGs } from '../data/sdgs';

const fallbackIcon = '/sdgs/default.svg';

// Map SDG codes for quick lookup
const sdgMap = SDGs.reduce((acc, sdg) => {
  const code = `SDG ${String(sdg.id).padStart(2, '0')}`;
  acc[code] = sdg;
  return acc;
}, {});

// Full month names
const MONTHS = [
  'All',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Campaigns({ campaigns = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMonth, setActiveMonth] = useState('All');
  const [activeSDG, setActiveSDG] = useState('All');

  // Extract unique SDG codes used in campaigns
  const sdgCategories = useMemo(() => {
    const codes = new Set();

    campaigns.forEach(({ data }) => {
      const sdgs = data?.SDGs ?? [];
      const ids = Array.isArray(sdgs) ? sdgs : [sdgs];
      ids.forEach(id => {
        if (typeof id === 'number') {
          codes.add(`SDG ${String(id).padStart(2, '0')}`);
        }
      });
    });

    return ['All', ...Array.from(codes).sort()];
  }, [campaigns]);

  // Filter logic
  const filteredCampaigns = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return campaigns.filter(({ data }) => {
      const {
        title = '',
        excerpt = '',
        tags = [],
        month = '',
        SDGs = [],
      } = data;

      const sdgCodes = Array.isArray(SDGs)
        ? SDGs.map(id => `SDG ${String(id).padStart(2, '0')}`)
        : typeof SDGs === 'number'
        ? [`SDG ${String(SDGs).padStart(2, '0')}`]
        : [];

      const matchesMonth = activeMonth === 'All' || month === activeMonth;
      const matchesSDG = activeSDG === 'All' || sdgCodes.includes(activeSDG);
      const matchesSearch =
        title.toLowerCase().includes(term) ||
        excerpt.toLowerCase().includes(term) ||
        tags.some(tag => tag.toLowerCase().includes(term));

      return matchesMonth && matchesSDG && matchesSearch;
    });
  }, [campaigns, searchTerm, activeMonth, activeSDG]);

  return (
    <div className="space-y-6">
      {/* SDG Filter */}
      <nav className="flex flex-wrap gap-2 border-b pb-3 border-gray-300 dark:border-gray-600">
        {sdgCategories.map(code => {
          const isActive = activeSDG === code;
          const sdg = sdgMap[code];

          return (
            <button
              key={code}
              onClick={() => setActiveSDG(code)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md transition ${
                isActive
                  ? 'bg-accent-600 text-white shadow'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700'
              }`}
            >
              {code !== 'All' && (
                <img
                  src={sdg?.icon || fallbackIcon}
                  alt={sdg?.name || code}
                  className="w-10 h-10 rounded-sm border border-gray-300 dark:border-gray-600"
                />
              )}
              <span>{code === 'All' ? 'All SDGs' : null}</span>
            </button>
          );
        })}
      </nav>

      {/* Month Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {MONTHS.map(month => (
          <button
            key={month}
            onClick={() => setActiveMonth(month)}
            className={`px-4 py-2 rounded font-semibold ${
              activeMonth === month
                ? 'bg-accent-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-accent-400'
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Campaigns</h2>
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-sm"
        />
      </div>

      {/* Campaigns Grid */}
      <ul className="grid gap-6 md:grid-cols-2" role="list">
        {filteredCampaigns.length === 0 ? (
          <li className="text-accent-500 italic">No campaigns found.</li>
        ) : (
          filteredCampaigns.map(({ data, slug, collection }) => {
            const {
              title,
              month,
              url,
              organisations = [],
              SDGs = [],
            } = data;

            const sdgIcons = Array.isArray(SDGs)
              ? SDGs.map(id => {
                  const code = `SDG ${String(id).padStart(2, '0')}`;
                  const sdg = sdgMap[code];
                  return (
                    <a
                      key={code}
                      href={`https://sdgs.greenorbit.space/${id}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={sdg?.icon || fallbackIcon}
                        alt={sdg?.name || code}
                        className="w-8 h-8 rounded-sm border border-gray-300 dark:border-gray-600"
                      />
                    </a>
                  );
                })
              : [];

            return (
              <li
                key={slug}
                className="border border-accent-500 p-4 rounded hover:shadow-md transition"
              >
                <div className="space-y-2">
                  <a
                    href={url || `/${collection}/${slug}`}
                    className="group-hover:text-white"
                  >
                    <h3 className="text-xl text-accent-500 font-semibold group-hover:underline">
                      {title}
                    </h3>
                  </a>

                  {month && <p className="text-sm text-white">{month}</p>}

                  {organisations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {organisations.map(org => (
                        <span
                          key={org}
                          className="bg-gray-300 dark:bg-accent-500 text-white rounded-full px-3 py-1 text-xs font-medium capitalize"
                        >
                          {org}
                        </span>
                      ))}
                    </div>
                  )}

                  {sdgIcons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">{sdgIcons}</div>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}