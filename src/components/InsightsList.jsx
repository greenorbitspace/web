import React, { useState, useMemo } from 'react';
import { SDGs } from '../data/sdgs';

// Optional: move to separate file if reused
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

const CATEGORIES = ['All', 'Blog', 'News', 'Resource'];

function SDGBadge({ slug, name }) {
  const bgColor = SDG_COLORS[slug] || fallbackColor;
  return (
    <span
      style={{ backgroundColor: bgColor }}
      className="inline-block text-white px-2 py-1 rounded text-xs font-semibold select-none"
      aria-label={`SDG tag for ${name}`}
    >
      #{slug.replace(/-/g, ' ')}
    </span>
  );
}

export default function InsightsList({ posts = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPosts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const activeCat = activeCategory.toLowerCase();

    return posts.filter(post => {
      const fm = post.data ?? {};
      const title = (fm.title ?? '').toLowerCase();
      const excerpt = (fm.excerpt ?? '').toLowerCase();
      const tags = fm.tags ?? [];
      const contentType = (fm.contentType ?? '').toLowerCase();

      const categoryMatch = activeCategory === 'All' || contentType === activeCat;
      const searchMatch =
        title.includes(term) ||
        excerpt.includes(term) ||
        tags.some(tag => tag.toLowerCase().includes(term));

      return categoryMatch && searchMatch;
    });
  }, [searchTerm, activeCategory, posts]);

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex space-x-4 mb-4" role="tablist">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded font-semibold ${
              activeCategory === category
                ? 'bg-accent-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-accent-400'
            }`}
            aria-pressed={activeCategory === category}
            role="tab"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Insights</h2>
        <input
          type="text"
          aria-label="Search insights"
          placeholder="Search articles, resources, news..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-sm"
        />
      </div>

      {/* Posts List */}
      <ul className="grid gap-6 md:grid-cols-2" role="list">
        {filteredPosts.length === 0 ? (
          <li className="text-accent-500 italic">No insights found.</li>
        ) : (
          filteredPosts.map(post => {
            const { title, pubdate, excerpt, tags = [], contentType, sdgs = [] } = post.data;
            const dateFormatted = pubdate
              ? new Date(pubdate).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : '';

            // Lookup SDG info
            const sdgBadges = sdgs
              .map(id => SDGs.find(sdg => sdg.id === id))
              .filter(Boolean)
              .map(sdg => (
                <SDGBadge key={sdg.id} slug={sdg.slug} name={sdg.name} />
              ));

            return (
              <li
                key={post.slug}
                className="border border-accent-500 p-4 rounded hover:shadow-md transition"
                role="listitem"
              >
                <a
                  href={`/${post.collection}/${post.slug}`}
                  className="block group space-y-2"
                  rel="noopener noreferrer"
                >
                  <h3 className="text-xl text-accent-500 font-semibold group-hover:text-white">
                    {title}
                  </h3>
                  {dateFormatted && (
                    <p className="text-sm text-white">{dateFormatted}</p>
                  )}
                  {excerpt && <p className="text-white text-sm">{excerpt}</p>}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
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

                  {/* Content Type */}
                  {contentType && (
                    <div className="mt-2">
                      <span className="inline-block bg-primary-600 text-white text-xs px-2 py-1 rounded uppercase">
                        {contentType}
                      </span>
                    </div>
                  )}

                  {/* SDG Badges */}
                  {sdgBadges.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">{sdgBadges}</div>
                  )}
                </a>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}