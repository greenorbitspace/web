import React, { useState, useMemo } from 'react';
import space4sdgs from '../data/space4sdgs.json' assert { type: 'json' };
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
const fallbackIcon = '/icons/sdg-placeholder.svg';

// Map SDG id (number) to SDG metadata object
const sdgMap = SDGs.reduce((acc, sdg) => {
  acc[Number(sdg.id)] = sdg;
  return acc;
}, {});

export default function Space4SDGsList() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return space4sdgs;
    return space4sdgs.filter(({ Space4SDGs = '', Description = '' }) =>
      `${Space4SDGs} ${Description}`.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  return (
    <section className="space-y-8" aria-labelledby="space4sdgs-heading">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 id="space4sdgs-heading" className="text-3xl font-bold">
          Space4SDGs Initiatives
        </h2>
        <input
          type="search"
          aria-label="Search initiatives"
          placeholder="Search initiatives..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </header>

      {filteredItems.length === 0 ? (
        <p className="italic text-accent-500" role="alert">
          No initiatives found.
        </p>
      ) : (
        <ul
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-live="polite"
          aria-relevant="additions removals"
        >
          {filteredItems.map((item, index) => {
            const sdgId = Number(item.SDGs);
            const sdg = sdgMap[sdgId];
            const icon = sdg?.icon || fallbackIcon;
            const name = sdg?.name || `SDG ${sdgId}`;
            const slug = sdg?.slug || `sdg-${sdgId}`;
            const bgColor = SDG_COLORS[slug] || fallbackColor;
            const linkHref = `https://sdgs.greenorbit.space/${sdgId}`;

            return (
              <li
                key={`space4sdg-${index}`}
                className="border border-accent-500 rounded-lg p-6 bg-white dark:bg-secondary-500 hover:shadow-md transition duration-200"
              >
                <article
                  className="flex flex-col h-full justify-between"
                  aria-labelledby={`sdg-title-${index}`}
                >
                  <div className="flex items-center gap-4">
                    <a href={linkHref} target="_blank" rel="noopener noreferrer">
                      <img
                        src={icon}
                        alt={`${name} icon`}
                        className="w-14 h-14"
                        loading="lazy"
                      />
                    </a>
                    <h3
                      id={`sdg-title-${index}`}
                      className="text-2xl font-semibold text-accent-500"
                    >
                      <a
                        href={linkHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-500 no-underline"
                      >
                        {name}
                      </a>
                    </h3>
                  </div>

                  <p className="text-gray-800 dark:text-white text-base">
                    {item.Space4SDGs}
                  </p>

                  <footer>
                    <a
                      href={linkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1 text-sm font-semibold text-white rounded"
                      style={{ backgroundColor: bgColor }}
                    >
                      SDG {sdgId}
                    </a>
                  </footer>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}