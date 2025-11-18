// src/components/ValuesList.jsx
import React, { useState, useMemo } from 'react';
import valuesData from '../data/values.json';

const fallbackIcon = '/icons/default.svg';

export default function ValuesList() {
  const [searchTerm, setSearchTerm] = useState('');

  const { guidingStar, coreValues } = valuesData;

  // Filter core values by search term
  const filteredCoreValues = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return coreValues
      .filter(({ title, tagline, description }) => {
        const combined = [title, tagline, description].filter(Boolean).join(' ').toLowerCase();
        return combined.includes(term);
      })
      .slice(0, 6);
  }, [searchTerm, coreValues]);

  return (
    <section className="w-full py-12" aria-label="Company Values">

      {/* Guiding Star - Full Width (aligned with core values section) */}
      {guidingStar && (
        <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto mb-12">
          <div
            className="border border-accent-500 rounded-xl p-6
                       bg-secondary-500 dark:bg-secondary-500 
                       hover:shadow-lg transition flex flex-col md:flex-row 
                       items-center md:items-start gap-8"
          >
            <img
              src={guidingStar.icon || fallbackIcon}
              alt={`${guidingStar.title} icon`}
              className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackIcon;
              }}
            />
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-accent-500 mb-2">{guidingStar.title}</h2>
              {guidingStar.tagline && (
                <span className="inline-block bg-accent-500 text-white px-3 py-1 rounded-full mb-4 text-sm font-medium">
                  {guidingStar.tagline}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Core Values Grid */}
      <ul
        className="grid gap-8 px-4 sm:px-6 md:px-8 
                   grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr"
        role="list"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {filteredCoreValues.length === 0 ? (
          <li className="italic text-accent-500 col-span-full text-center" role="alert">
            No values found.
          </li>
        ) : (
          filteredCoreValues.map(({ title, tagline, description, icon }, index) => (
            <li
              key={`${title}-${index}`}
              className="border border-accent-500 rounded-xl p-6 
                         bg-white dark:bg-secondary-500 
                         hover:shadow-lg transition text-accent-500
                         flex flex-col items-center"
              role="listitem"
            >
              <article
                aria-labelledby={`value-title-${index}`}
                className="flex flex-col items-center h-full text-center"
              >
                <img
                  src={icon || fallbackIcon}
                  alt={`${title} icon`}
                  className="w-16 h-16 object-contain mb-4 rounded-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackIcon;
                  }}
                />

                <h3
                  id={`value-title-${index}`}
                  className="text-xl font-semibold text-accent-500 mb-2"
                  tabIndex={0}
                >
                  {title}
                </h3>

                {tagline && (
                  <span className="inline-block bg-accent-500 text-white px-3 py-1 rounded-full mb-4 text-sm font-medium">
                    {tagline}
                  </span>
                )}
              </article>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}