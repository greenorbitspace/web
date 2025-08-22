import React, { useState, useMemo } from 'react';
import { SDGs } from '../data/sdgs';

const fallbackIcon = '/sdgs/default.svg';
const fallbackImage = '/images/placeholder.jpg';

// Map SDGs for quick lookup
const sdgMap = SDGs.reduce((acc, sdg) => {
  const code = `SDG ${String(sdg.id).padStart(2, '0')}`;
  acc[code.toUpperCase()] = sdg;
  return acc;
}, {});

export default function ThemesList({ themes = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSDG, setActiveSDG] = useState('All');

  // --- Categories ---
  const categories = useMemo(() => {
    const set = new Set(['for space', 'from space', 'in space']);
    themes.forEach(t => t.data?.category && set.add(t.data.category));
    return ['All', ...Array.from(set).sort()];
  }, [themes]);

  // --- SDG codes ---
  const sdgCategories = useMemo(() => {
    const set = new Set();
    themes.forEach(t => {
      const sdgs = t.data?.SDGs;
      if (Array.isArray(sdgs)) sdgs.forEach(id => set.add(`SDG ${String(id).padStart(2, '0')}`));
      else if (typeof sdgs === 'number') set.add(`SDG ${String(sdgs).padStart(2, '0')}`);
    });
    return ['All', ...Array.from(set).sort()];
  }, [themes]);

  // --- Filter themes ---
  const filteredThemes = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return themes.filter(theme => {
      const { title = '', summary = '', tags = [], category = '', SDGs = [] } = theme.data ?? {};

      const sdgCodes = Array.isArray(SDGs)
        ? SDGs.map(id => `SDG ${String(id).padStart(2, '0')}`)
        : typeof SDGs === 'number'
        ? [`SDG ${String(SDGs).padStart(2, '0')}`]
        : [];

      const matchesSDG = activeSDG === 'All' || sdgCodes.includes(activeSDG);
      const matchesCategory = activeCategory === 'All' || category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        title.toLowerCase().includes(term) ||
        summary.toLowerCase().includes(term) ||
        tags.some(tag => tag.toLowerCase().includes(term));

      return matchesSDG && matchesCategory && matchesSearch;
    });
  }, [themes, searchTerm, activeCategory, activeSDG]);

  // --- Handlers for clickable tags/categories/SDGs ---
  const handleCategoryClick = category => setActiveCategory(category);
  const handleSDGClick = sdg => setActiveSDG(sdg);
  const handleTagClick = tag => setSearchTerm(tag);

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
                onClick={() => handleSDGClick(code)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md transition ${
                  activeSDG === code
                    ? 'bg-accent-600 text-white shadow'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700'
                }`}
              >
                <img
                  src={sdg?.icon || fallbackIcon}
                  alt={sdg?.name || code}
                  className="w-10 h-10 rounded-sm border border-gray-300 dark:border-gray-600"
                />
                <span className="sr-only">{sdg?.name}</span>
              </button>
            );
          })}
      </nav>

      {/* Category Tabs */}
      <div className="flex flex-wrap space-x-4 mb-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`px-4 py-2 rounded font-semibold ${
              activeCategory === category
                ? 'bg-accent-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-accent-400'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Themes</h2>
        <input
          type="text"
          placeholder="Search themes..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-sm"
        />
      </div>

      {/* Themes Grid */}
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list">
        {filteredThemes.length === 0 ? (
          <li className="text-accent-500 italic">No themes found.</li>
        ) : (
          filteredThemes.map(theme => {
            const { title, summary, tags = [], category, organisations = [], SDGs = [], featuredImage } = theme.data;

            const sdgIcons = SDGs?.length
              ? SDGs.map(id => {
                  const code = `SDG ${String(id).padStart(2, '0')}`;
                  const sdg = sdgMap[code.toUpperCase()];
                  return (
                    <button
                      key={code}
                      onClick={() => handleSDGClick(code)}
                      className="hover:opacity-80 transition"
                      title={sdg?.name || code}
                    >
                      <img
                        src={sdg?.icon || fallbackIcon}
                        alt={sdg?.name || code}
                        className="w-8 h-8 rounded-sm border border-gray-300 dark:border-gray-600"
                      />
                    </button>
                  );
                })
              : null;

            return (
              <li key={theme.slug} className="border border-accent-500 rounded overflow-hidden hover:shadow-md transition flex flex-col">
                <div className="p-4 flex flex-col flex-1">
                  <a href={`/themes/${theme.slug}`} className="block group-hover:text-white">
                    <h3 className="text-xl text-accent-500 font-semibold group-hover:underline">{title}</h3>
                  </a>
                  {summary && <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">{summary}</p>}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagClick(tag)}
                          className="inline-block bg-accent-500 text-white text-xs px-2 py-1 rounded hover:opacity-80 transition"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}

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

                  {category && (
                    <button
                      onClick={() => handleCategoryClick(category)}
                      className="mt-2 inline-block bg-primary-600 text-white text-xs px-2 py-1 rounded uppercase hover:opacity-80 transition"
                    >
                      {category}
                    </button>
                  )}

                  {sdgIcons && <div className="mt-2 flex flex-wrap gap-2">{sdgIcons}</div>}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}