import React, { useMemo } from 'react';
import { SDGs } from '../data/sdgs';
import { slug as slugify } from 'github-slugger';

const fallbackIcon = '/sdgs/default.svg';
const fallbackImage = '/images/placeholder.jpg';

// Map SDGs for quick lookup
const sdgMap = SDGs.reduce((acc, sdg) => {
  const code = `SDG ${String(sdg.id).padStart(2, '0')}`;
  acc[code.toUpperCase()] = sdg;
  return acc;
}, {});

/**
 * Props:
 *  - themes: array of theme objects
 *  - categorySlug: optional string for current category filtering
 */
export default function AllThemes({ themes = [], categorySlug = null }) {
  // Filter themes by categorySlug if provided
  const filteredThemes = useMemo(() => {
    if (!categorySlug) return themes;
    return themes.filter(
      t => slugify(t.data?.category || 'uncategorized') === categorySlug
    );
  }, [themes, categorySlug]);

  // Build list of categories for filter bar
  const categories = useMemo(() => {
    const unique = new Set(themes.map(t => t.data?.category || 'Uncategorized'));
    return Array.from(unique).map(name => ({ name, slug: slugify(name) }));
  }, [themes]);

  if (!themes.length) {
    return <p className="text-white mt-6">No themes available.</p>;
  }

  return (
    <div>
      {/* Category Filter Bar */}
      {categories.length > 0 && (
        <nav aria-label="Theme categories" className="mb-6 flex flex-wrap gap-2">
          {categories.map(cat => {
            const isActive = cat.slug === categorySlug;
            return (
              <a
                key={cat.slug}
                href={`/space-sustainability/${cat.slug}`}
                className={`px-3 py-1 rounded text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-accent-400 ${
                  isActive
                    ? 'bg-accent-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-accent-400'
                }`}
              >
                {cat.name}
              </a>
            );
          })}
        </nav>
      )}

      {/* Themes Grid */}
      {filteredThemes.length === 0 ? (
        <p className="text-white mt-6">No themes available for this category.</p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredThemes.map(theme => {
            const {
              title = 'Untitled Theme',
              summary = '',
              SDGs: themeSDGs = [],
              featuredImage,
              tags = [],
              organisations = [],
              category = 'Uncategorized',
            } = theme.data ?? {};

            const themeSlug = theme.slug || slugify(title);
            const themeCategorySlug = categorySlug || slugify(category);

            const sdgCodes = Array.isArray(themeSDGs)
              ? themeSDGs.filter(n => typeof n === 'number').map(n => `SDG ${String(n).padStart(2, '0')}`)
              : [];

            return (
              <li
                key={themeSlug}
                className="border rounded overflow-hidden hover:shadow-md transition flex flex-col"
                role="listitem"
              >
                <img
                  src={featuredImage || fallbackImage}
                  alt={`Image for ${title}`}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />

                <div className="p-4 flex flex-col flex-1">
                  <a
                    href={`/space-sustainability/${themeCategorySlug}/${themeSlug}`}
                    className="block group-hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-400"
                  >
                    <h3 className="text-xl text-accent-500 font-semibold group-hover:underline">
                      {title}
                    </h3>
                  </a>

                  {summary && <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">{summary}</p>}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2" aria-label="Tags">
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-block bg-accent-500 text-white text-xs px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Organisations */}
                  {organisations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2" aria-label="Organisations involved">
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

                  {/* SDGs */}
                  {sdgCodes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2" aria-label="Related SDGs">
                      {sdgCodes.map(code => {
                        const sdg = sdgMap[code.toUpperCase()];
                        if (!sdg) return null;
                        return (
                          <a
                            key={code}
                            href={`https://sdgs.greenorbit.space/${sdg.id}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View details for ${sdg.title}`}
                          >
                            <img
                              src={sdg.icon || fallbackIcon}
                              alt={sdg.title || code}
                              className="w-8 h-8 rounded-sm border border-gray-300 dark:border-gray-600"
                              loading="lazy"
                            />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}