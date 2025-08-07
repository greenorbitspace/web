import React, { useState, useMemo } from 'react';
import space4sdgsData from '../data/space4sdgs.json';
import { SDGs } from '../data/sdgs';

const fallbackColor = '#666';
const fallbackIcon = '/icons/sdg-placeholder.svg';

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

// Map SDG ID to full SDG metadata
const sdgMap = SDGs.reduce((acc, sdg) => {
  acc[sdg.id] = sdg;
  return acc;
}, {});

export default function Space4SDGsList() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return space4sdgsData.filter(({ Space4SDGs, Description }) => {
      const combined = `${Space4SDGs} ${Description}`.toLowerCase();
      return combined.includes(term);
    });
  }, [searchTerm]);

  return (
    <section className="space-y-6" aria-label="Space4SDGs Initiatives">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 id="space4sdg-heading" className="text-3xl font-bold">
          Space4SDGs
        </h2>
        <input
          type="search"
          aria-labelledby="space4sdg-heading"
          placeholder="Search initiatives..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      <ul
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {filteredItems.length === 0 ? (
          <li className="italic text-accent-500" role="alert">
            No initiatives found.
          </li>
        ) : (
          filteredItems.map((item, index) => {
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
                className="border border-accent-500 rounded-lg p-6 bg-white dark:bg-secondary-500 hover:shadow-lg transition"
                role="listitem"
              >
                <article className="flex flex-col h-full" aria-labelledby={`sdg-title-${index}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <a href={linkHref} target="_blank" rel="noopener noreferrer">
                      <img
                        src={icon}
                        alt={`${name} icon`}
                        className="w-14 h-14 flex-shrink-0"
                        loading="lazy"
                      />
                    </a>
                    <h3 id={`sdg-title-${index}`} className="text-2xl font-semibold text-accent-500">
                      <a
                        href={linkHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {name}
                      </a>
                    </h3>
                  </div>
                  <p className="text-white dark:text-white mb-2 text-m">
                    {item.Space4SDGs}
                  </p>
                  <footer className="mt-6">
                    <a
                      href={linkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ backgroundColor: bgColor }}
                      className="inline-block text-white px-3 py-1 rounded font-semibold text-sm"
                    >
                      SDG {sdgId}
                    </a>
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