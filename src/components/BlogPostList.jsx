import React, { useState, useMemo } from 'react';

const BlogPostList = ({ posts }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return posts.filter(post =>
      post.title.toLowerCase().includes(term) ||
      post.excerpt?.toLowerCase().includes(term) ||
      post.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  }, [searchTerm, posts]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog</h2>
        <input
          type="text"
          placeholder="Search blog posts..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-sm"
        />
      </div>

      <ul className="grid gap-6 md:grid-cols-2">
        {filteredPosts.length === 0 ? (
          <li className="text-gray-500 italic">No posts found.</li>
        ) : (
          filteredPosts.map(post => (
            <li
              key={post.slug}
              className="border border-gray-200 p-4 rounded hover:shadow-md transition"
            >
              <a href={`/blog/${post.slug}`} className="block group">
                <h3 className="text-xl font-semibold group-hover:text-blue-600">
                  {post.title}
                </h3>
                {post.date && (
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(post.date).toLocaleDateString()}
                  </p>
                )}
                <p className="text-gray-700">{post.excerpt}</p>
                {post.tags?.length > 0 && (
                  <div className="mt-2 space-x-2">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                      >
                        #{tag}
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
};

export default BlogPostList;