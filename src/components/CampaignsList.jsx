import React, { useState, useMemo } from 'react';
import { SDGs } from '../data/sdgs';

const fallbackIcon = '/sdgs/default.svg';

const sdgMap = SDGs.reduce((acc, sdg) => {
  const code = `SDG ${String(sdg.id).padStart(2, '0')}`;
  acc[code] = sdg;
  return acc;
}, {});

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Campaigns({ campaigns = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSDG, setActiveSDG] = useState('All');
  const [activeOrg, setActiveOrg] = useState('All');

  // Unique SDG codes for filter
  const sdgCategories = useMemo(() => {
    const codes = new Set();
    campaigns.forEach(({ data }) => {
      const ids = Array.isArray(data?.SDGs) ? data.SDGs : [data?.SDGs];
      ids.forEach(id => {
        if (typeof id === 'number') {
          codes.add(`SDG ${String(id).padStart(2, '0')}`);
        }
      });
    });
    return ['All', ...Array.from(codes).sort()];
  }, [campaigns]);

  // Unique organisations for dropdown
  const orgCategories = useMemo(() => {
    const orgs = new Set();
    campaigns.forEach(({ data }) => {
      (data?.organisations || []).forEach(org => {
        if (org && typeof org === 'string') {
          orgs.add(org);
        }
      });
    });
    return ['All', ...Array.from(orgs).sort()];
  }, [campaigns]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return campaigns.filter(({ data }) => {
      const {
        title = '',
        excerpt = '',
        tags = [],
        SDGs = [],
        organisations = [],
      } = data;

      const sdgCodes = Array.isArray(SDGs)
        ? SDGs.map(id => `SDG ${String(id).padStart(2, '0')}`)
        : typeof SDGs === 'number'
        ? [`SDG ${String(SDGs).padStart(2, '0')}`]
        : [];

      const matchesSDG = activeSDG === 'All' || sdgCodes.includes(activeSDG);
      const matchesOrg = activeOrg === 'All' || organisations.includes(activeOrg);
      const matchesSearch =
        title.toLowerCase().includes(term) ||
        excerpt.toLowerCase().includes(term) ||
        tags.some(tag => tag.toLowerCase().includes(term));

      return matchesSDG && matchesOrg && matchesSearch;
    });
  }, [campaigns, searchTerm, activeSDG, activeOrg]);

  // Group by month
  const campaignsByMonth = useMemo(() => {
    const groups = {};
    MONTHS.forEach(month => {
      groups[month] = [];
    });
    filteredCampaigns.forEach(campaign => {
      const month = campaign.data.month || 'Other';
      if (!groups[month]) groups[month] = [];
      groups[month].push(campaign);
    });
    return groups;
  }, [filteredCampaigns]);

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
              {code === 'All' && <span>All SDGs</span>}
            </button>
          );
        })}
      </nav>

      {/* Organisation Dropdown Filter */}
      <div className="mb-4">
        <label htmlFor="org-filter" className="block text-sm font-medium mb-1">
          Filter by Organisation
        </label>
        <select
          id="org-filter"
          value={activeOrg}
          onChange={(e) => setActiveOrg(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-xs text-primary-500"
        >
          {orgCategories.map(org => (
            <option key={org} value={org}>
              {org === 'All' ? 'All Organisations' : org}
            </option>
          ))}
        </select>
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

      {/* Campaigns grouped by month */}
      {MONTHS.map(month => {
        const monthCampaigns = campaignsByMonth[month] || [];
        if (monthCampaigns.length === 0) return null;

        return (
          <section key={month} className="space-y-4">
            <h3 className="text-xl font-semibold text-accent-500">{month}</h3>
            <ul className="grid gap-6 md:grid-cols-2" role="list">
              {monthCampaigns.map(({ data, slug, collection }) => {
                const {
                  title,
                  organisations = [],
                  SDGs = [],
                  unResolution,
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
                      <a href={`/${collection}/${slug}`}>
                        <h4 className="text-lg font-semibold text-accent-500 hover:underline">
                          {title}
                        </h4>
                      </a>

                      {organisations.length > 0 && (
                        <div className="flex flex-wrap gap-2">
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

                      {/* Show unResolution below organisations */}
                      {unResolution && (
                        <p className="text-sm text-gray-500">
                          <strong>UN Resolution:</strong> {unResolution}
                        </p>
                      )}

                      {sdgIcons.length > 0 && (
                        <div className="flex flex-wrap gap-2">{sdgIcons}</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}