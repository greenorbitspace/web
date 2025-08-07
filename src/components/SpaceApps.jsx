import React, { useState, useMemo } from 'react';
import applications from '../data/space-apps.json';
import { SDGs } from '../data/sdgs';

const fallbackIcon = '/icons/sdg-placeholder.svg';

const sdgMap = SDGs.reduce((acc, sdg) => {
  acc[sdg.id] = sdg;
  return acc;
}, {});

export default function SpaceApps() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSDG, setActiveSDG] = useState(null); // null means no filter, show all

  const filteredApps = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return applications.filter((app) => {
      const text = `${app.Name ?? ''} ${app.Description ?? ''} ${app.Markets ?? ''} ${app.Domains ?? ''}`.toLowerCase();
      const matchesSearch = text.includes(term);

      const sdgIds = Array.isArray(app.SDGs)
        ? app.SDGs.map(Number).filter(Boolean)
        : typeof app.SDGs === 'string'
        ? app.SDGs.split(',').map((id) => Number(id.trim())).filter(Boolean)
        : [];

      const matchesSDG = activeSDG === null || sdgIds.includes(activeSDG);

      return matchesSearch && matchesSDG;
    });
  }, [searchTerm, activeSDG]);

  return (
    <section className="space-y-6" aria-label="Space Applications">
      {/* Header + Search Input */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 id="space-apps-heading" className="text-3xl font-bold">
          Space Applications
        </h2>
        <input
          type="search"
          aria-labelledby="space-apps-heading"
          placeholder="Search applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      {/* SDG Filter Navigation */}
      <nav className="flex flex-wrap gap-2 border-b pb-3 border-gray-300 dark:border-gray-600" aria-label="SDG Filters">
        <button
          onClick={() => setActiveSDG(null)}
          className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
            activeSDG === null
              ? 'bg-accent-600 text-white shadow'
              : 'text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700'
          }`}
        >
          All SDGs
        </button>
        {SDGs.map((sdg) => (
          <button
            key={`filter-sdg-${sdg.id}`}
            onClick={() => setActiveSDG(activeSDG === sdg.id ? null : sdg.id)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md transition ${
              activeSDG === sdg.id
                ? 'bg-accent-600 text-white shadow'
                : 'text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700'
            }`}
            aria-label={`Filter by ${sdg.name}`}
          >
            <img
              src={sdg.icon || fallbackIcon}
              alt={sdg.name}
              className="w-6 h-6 rounded-sm border border-gray-300 dark:border-gray-600"
            />
            <span>{sdg.name}</span>
          </button>
        ))}
      </nav>

      {/* Applications Grid */}
      <ul
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {filteredApps.length === 0 ? (
          <li className="italic text-accent-500" role="alert">
            No applications found.
          </li>
        ) : (
          filteredApps.map((app, index) => {
            const sdgIds = Array.isArray(app.SDGs)
              ? app.SDGs.map(Number).filter(Boolean)
              : typeof app.SDGs === 'string'
              ? app.SDGs.split(',').map((id) => Number(id.trim())).filter(Boolean)
              : [];

            return (
              <li
                key={`space-app-${index}`}
                className="border border-accent-500 rounded-lg p-6 bg-white dark:bg-secondary-500 hover:shadow-lg transition"
                role="listitem"
              >
                <article className="flex flex-col h-full" aria-labelledby={`app-title-${index}`}>
                  <h3
                    id={`app-title-${index}`}
                    className="text-2xl font-semibold text-accent-500 mb-2"
                  >
                    {app.Name}
                  </h3>
                  <p className="mb-1">
                    <strong>Markets:</strong> {app.Markets || 'N/A'}
                  </p>
                  <p className="mb-1">
                    <strong>Domains:</strong> {app.Domains || 'N/A'}
                  </p>
                  {app.Description && (
                    <p className="mt-2 text-white text-sm flex-grow">{app.Description}</p>
                  )}

                  {sdgIds.length > 0 && (
                    <footer className="mt-4 flex flex-wrap gap-2 items-center">
                      {sdgIds.map((id) => {
                        const sdg = sdgMap[id];
                        const icon = sdg?.icon || fallbackIcon;

                        return (
                          <a
                            key={`sdg-icon-${id}`}
                            href={`https://sdgs.greenorbit.space/${id}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                            aria-label={`Sustainable Development Goal: ${sdg?.name || `SDG ${id}`}`}
                          >
                            <img
                              src={icon}
                              alt={sdg?.name || `SDG ${id}`}
                              className="w-8 h-8 rounded-sm border border-gray-300 dark:border-gray-600"
                            />
                          </a>
                        );
                      })}
                    </footer>
                  )}
                </article>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}