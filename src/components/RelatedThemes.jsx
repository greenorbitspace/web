// RelatedThemes.jsx
import React, { useState } from 'react';

export default function RelatedThemes({ themes, currentCategory, currentSlug }) {
  const [activeCategory, setActiveCategory] = useState(currentCategory || 'All');

  const filtered = themes.filter(
    t => t.slug !== currentSlug && (activeCategory === 'All' || t.data.category === activeCategory)
  );

  const categories = ['All', ...Array.from(new Set(themes.map(t => t.data.category)))];

  return (
    <div>
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded ${
              activeCategory === cat ? 'bg-accent-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Theme List */}
      <ul className="grid gap-4 md:grid-cols-2">
        {filtered.map(t => (
          <li key={t.slug} className="border rounded p-4">
            <a href={`/themes/${t.slug}`} className="font-semibold text-accent-500 hover:underline">
              {t.data.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}