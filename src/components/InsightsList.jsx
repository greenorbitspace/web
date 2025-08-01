import React, { useState, useMemo } from 'react';
import { slug as slugify } from 'github-slugger';

export default function InsightsList({ posts = [] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return posts.filter((post) => {
      const fm = post.data ?? {};
      const title = (fm.title ?? '').toLowerCase();
      const excerpt = (fm.excerpt ?? '').toLowerCase();
      const tags = fm.tags ?? [];
      const categories = fm.categories ?? [];
      const authorSlug = slugify(fm.author ?? '');

      const matchesSearch =
        title.includes(term) ||
        excerpt.includes(term) ||
        tags.some((tag) => tag.toLowerCase().includes(term)) ||
        categories.some((cat) => cat.toLowerCase().includes(term));

      return matchesSearch;
    });
  }, [searchTerm, posts]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Insights</h2>
        <input
          type="text"
          aria-label="Search insights"
          placeholder="Search articles, resources, news..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-sm"
        />
      </div>

      <ul className="grid gap-6 md:grid-cols-2" role="list">
        {filteredPosts.length === 0 ? (
          <li className="text-accent-500 italic">No insights found.</li>
        ) : (
          filteredPosts.map((post) => (
            <li
              key={post.slug}
              className="border border-accent-500 p-4 rounded hover:shadow-md transition"
            >
              <a href={`/${post.collection}/${post.slug}`} className="block group" rel="noopener noreferrer">
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
                {post.data.categories?.length > 0 && (
                  <div className="mt-2 space-x-2">
                    {post.data.categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-block bg-accent-500 text-white text-xs px-2 py-1 rounded"
                      >
                        #{cat}
                      </span>
                    ))}
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