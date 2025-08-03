import React, { useState, useMemo } from 'react';

const CATEGORIES = ['All', 'Blog', 'News', 'Resource'];

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

      // Match category tab (or all)
      const categoryMatch = activeCategory === 'All' || contentType === activeCat;

      // Match search term in title, excerpt, or tags
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
      <div className="flex space-x-4 mb-4">
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
          filteredPosts.map(post => (
            <li
              key={post.slug}
              className="border border-accent-500 p-4 rounded hover:shadow-md transition"
            >
              <a
                href={`/${post.collection}/${post.slug}`}
                className="block group"
                rel="noopener noreferrer"
              >
                <h3 className="text-xl text-accent-500 font-semibold group-hover:text-white">
                  {post.data.title}
                </h3>
                {post.data.pubdate && (
                  <p className="text-sm text-white mb-2">
                    {new Date(post.data.pubdate).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
                {post.data.excerpt && <p className="text-white">{post.data.excerpt}</p>}
                {post.data.tags?.length > 0 && (
                  <div className="mt-2 space-x-2">
                    {post.data.tags.map(tags => (
                      <span
                        key={tags}
                        className="inline-block bg-accent-500 text-white text-xs px-2 py-1 rounded"
                      >
                        #{tags}
                      </span>
                    ))}
                  </div>
                )}
                {/* Show contentType badge */}
                {post.data.contentType && (
                  <div className="mt-2">
                    <span className="inline-block bg-primary-600 text-white text-xs px-2 py-1 rounded uppercase">
                      {post.data.contentType}
                    </span>
                  </div>
                )}
              </a>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}