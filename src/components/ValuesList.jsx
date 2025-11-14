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
      .slice(0, 6);
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