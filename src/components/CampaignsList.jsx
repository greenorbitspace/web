import React, { useState, useMemo } from 'react';
import { SDGs } from '../data/sdgs';

const fallbackIcon = '/sdgs/default.svg';

const sdgMap = SDGs.reduce((acc, sdg) => {
  const code = `SDG ${String(sdg.id).padStart(2, '0')}`;
  acc[code.toUpperCase()] = sdg;
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

  const toggleFilter = (current, value, setter) =>
    setter(current === value ? 'All' : value);

  // SDG categories
  const sdgCategories = useMemo(() => {
    const codes = new Set();
    campaigns.forEach(({ data }) => {
      const ids = Array.isArray(data?.SDGs) ? data.SDGs : [data?.SDGs];
      ids.forEach(id => {
        if (typeof id === 'number') codes.add(`SDG ${String(id).padStart(2, '0')}`);
      });
    });
    return ['All', ...Array.from(codes).sort()];
  }, [campaigns]);

  // Organisation categories
  const orgCategories = useMemo(() => {
    const orgs = new Set();
    campaigns.forEach(({ data }) => {
      (data?.organisations || []).forEach(org => {
        if (org && typeof org === 'string') orgs.add(org);
      });
    });
    return ['All', ...Array.from(orgs).sort()];
  }, [campaigns]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return campaigns.filter(({ data }) => {
      const { title = '', excerpt = '', tags = [], SDGs = [], organisations = [] } = data;

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

  // Group campaigns by month
  const campaignsByMonth = useMemo(() => {
    const groups = {};
    MONTHS.forEach(month => (groups[month] = []));
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
        <button
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
          .filter(code => code !== 'All')
          .map(code => {
            const sdg = sdgMap[code.toUpperCase()];
            return (
              <button
                key={code}
                onClick={() => setActiveSDG(code)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md transition ${
                  activeSDG === code
                    ? 'bg-accent-600 text-white shadow'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700'
                }`}
              >
                <img
                  src={sdg?.icon || fallbackIcon}
                  alt={sdg?.name || code}
                  className="w-10 h-10 rounded-sm"
                />
                <span className="sr-only">{sdg?.name}</span>
              </button>
            );
          })}
      </nav>

      {/* Organisation Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {orgCategories.map(org => (
          <button
            key={org}
            onClick={() => toggleFilter(activeOrg, org, setActiveOrg)}
            className={`px-3 py-1 rounded text-xs font-medium ${
              activeOrg === org
                ? 'bg-accent-600 text-white'
                : 'bg-gray-300 dark:bg-accent-500 text-white'
            }`}
          >
            {org === 'All' ? 'All Organisations' : org}
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

      {/* Campaigns grouped by month */}
      {Object.entries(campaignsByMonth).map(([month, monthCampaigns]) => {
        if (!monthCampaigns.length) return null;

        return (
          <section key={month} className="space-y-4">
            <h3 className="text-xl font-semibold text-accent-500">{month}</h3>
            <ul className="grid gap-6 md:grid-cols-2" role="list">
              {monthCampaigns.map(({ data, slug, collection }) => {
                const { title, url = null, organisations = [], SDGs = [], excerpt = '' } = data;

                // Handle both snake_case and kebab-case frontmatter
                const unResolution =
                  data.un_resolution ?? data['un-resolution'] ?? null;

                const sdgIcons = Array.isArray(SDGs)
                  ? SDGs.map(id => {
                      const code = `SDG ${String(id).padStart(2, '0')}`;
                      const sdg = sdgMap[code.toUpperCase()];
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
                            className="w-8 h-8 rounded-sm"
                          />
                        </a>
                      );
                    })
                  : [];

                return (
                  <li
                    key={slug}
                    className="bg-white border border-accent-500 rounded overflow-hidden hover:shadow-md transition"
                  >
                    <div className="p-4 space-y-2">
                      <a href={`/${collection}/${slug}`} className="block">
                        <h3 className="text-xl text-primary-500 font-semibold hover:underline">{title}</h3>
                      </a>

                      {excerpt && <p className="text-gray-700 dark:text-gray-300 text-sm">{excerpt}</p>}

                      {organisations.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {organisations.map(org => (
                            <span
                              key={org}
                              onClick={() => setActiveOrg(org)}
                              className="bg-gray-300 dark:bg-accent-500 text-white rounded-full px-3 py-1 text-xs font-medium capitalize cursor-pointer"
                            >
                              {org}
                            </span>
                          ))}
                        </div>
                      )}

                      {unResolution && (
                        <p class="mt-2 text-sm text-gray-400">
                          <strong>UN Resolution:</strong>{' '}
                          <a
                            href={`https://undocs.org/${encodeURIComponent(unResolution.replace(/\s+/g, '').replace(/$begin:math:text$/g,'%28').replace(/$end:math:text$/g,'%29'))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-accent-500 hover:underline"
                          >
                            {unResolution}
                          </a>
                        </p>
                      )}

                      {sdgIcons.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{sdgIcons}</div>}

                      {url && (
                        <div className="mt-4">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-accent-500 text-white px-4 py-2 rounded hover:bg-accent-600 transition"
                          >
                            View Campaign
                          </a>
                        </div>
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