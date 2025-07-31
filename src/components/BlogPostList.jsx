// components/BlogPostList.jsx
import { useState } from 'preact/hooks';

export default function BlogPostList({ posts }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(6);

  const categories = ['All', ...new Set(posts.map(post => post.category))];

  const filteredPosts = selectedCategory === 'All'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  return (
    <div class="container-custom py-8">
      {/* Filters */}
      <div class="flex flex-wrap gap-4 justify-center mb-12">
        {categories.map((category) => (
          <button
            onClick={() => {
              setSelectedCategory(category);
              setVisibleCount(6); // Reset pagination when filter changes
            }}
            class={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-accent-500 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Post Cards */}
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visiblePosts.map((post, index) => (
          <div key={post.id} class="card border border-gray-200 dark:border-gray-700 overflow-hidden slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <a href={`/blog/${post.id}`} class="block">
              <img src={post.image} alt={post.title} class="w-full h-48 object-cover" loading="lazy" />
            </a>
            <div class="p-6">
              <div class="flex items-center mb-4">
                <span class="text-sm font-medium text-primary-600 dark:text-accent-500">{post.category}</span>
                <span class="mx-2 text-gray-300 dark:text-white">•</span>
                <span class="text-sm text-gray-500 dark:text-white">{post.date}</span>
              </div>
              <a href={`/blog/${post.id}`} class="block mb-3">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{post.title}</h2>
              </a>
              <p class="text-gray-600 dark:text-white mb-6">{post.excerpt}</p>
              <div class="flex items-center">
                <img src={post.authorAvatar} alt={post.author} class="w-10 h-10 rounded-full mr-3 object-cover" loading="lazy" />
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{post.author}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{post.authorRole}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {visibleCount < filteredPosts.length && (
        <div class="mt-12 flex justify-center">
          <button
            onClick={() => setVisibleCount(visibleCount + 6)}
            class="btn-outline flex items-center"
          >
            Load More Articles
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v10.586l3.293-3.293a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}