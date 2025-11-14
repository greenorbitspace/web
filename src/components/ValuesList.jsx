// src/components/ValuesList.jsx
import React, { useState, useMemo } from 'react';
import valuesData from '../data/values.json';

const fallbackIcon = '/icons/default.svg';

export default function ValuesList() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredValues = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return valuesData
      .filter(({ title, tagline, description }) => {
        const combined = [title, tagline, description].filter(Boolean).join(' ').toLowerCase();
        return combined.includes(term);
      })
      .slice(0, 6); // Limit to 6 items (3 x 2 grid)
  }, [searchTerm]);

  return (
    <section className="w-full py-12" aria-label="Company Values">
      <ul
        className="grid gap-8 px-4 sm:px-6 md:px-8 
                   grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
                   auto-rows-fr"
        role="list"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {filteredValues.length === 0 ? (
          <li
            className="italic text-accent-500 col-span-full text-center"
            role="alert"
          >
            No values found.
          </li>
        ) : (
          filteredValues.map(({ title, tagline, description, icon }, index) => (
            <li
              key={`${title}-${index}`}
              className="border border-accent-500 rounded-xl p-6 
                         bg-white dark:bg-secondary-500 
                         hover:shadow-lg transition text-accent-500
                         flex flex-col justify-between"
              role="listitem"
            >
              <article
                aria-labelledby={`value-title-${index}`}
                className="flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={icon || fallbackIcon}
                    alt={`${title} icon`}
                    className="w-14 h-14 object-contain flex-shrink-0 rounded-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackIcon;
                    }}
                  />
                  <h3
                    id={`value-title-${index}`}
                    className="text-xl font-semibold text-accent-500"
                    tabIndex={0}
                  >
                    {title}
                  </h3>
                </div>
                {tagline && (
                  <p className="text-sm text-gray-500 dark:text-white mb-2 italic">
                    {tagline}
                  </p>
                )}
                {description && (
                  <p className="text-gray-700 dark:text-white text-base leading-relaxed">
                    {description}
                  </p>
                )}
              </article>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}