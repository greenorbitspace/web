import React, { useState, useMemo } from 'react';
import toolsData from '../data/tools'; // Adjust path if necessary

const CATEGORIES = ['All', 'CRM', 'Marketing', 'Analytics', 'Automation', 'Communication', 'Finance', 'Productivity'];

export default function ToolsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTools = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const category = activeCategory.toLowerCase();

    return toolsData.filter(tool => {
      const name = (tool.name ?? '').toLowerCase();
      const desc = (tool.description ?? '').toLowerCase();
      const tags = tool.tags ?? [];
      const toolCategory = (tool.category ?? '').toLowerCase();

      const categoryMatch = activeCategory === 'All' || toolCategory === category;
      const searchMatch =
        name.includes(term) ||
        desc.includes(term) ||
        tags.some(tag => tag.toLowerCase().includes(term));

      return categoryMatch && searchMatch;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded font-semibold transition ${
              activeCategory === cat
                ? 'bg-accent-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-accent-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tool Integrations</h2>
        <input
          type="text"
          placeholder="Search tools..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-sm"
        />
      </div>

      {/* Tool Cards */}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {filteredTools.length === 0 ? (
          <li className="italic text-accent-500">No tools found.</li>
        ) : (
          filteredTools.map(tool => (
            <li
              key={tool.slug}
              className="border border-accent-500 rounded-lg p-6 bg-white dark:bg-secondary-700 hover:shadow-lg transition"
            >
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block group space-y-2"
              >
                {tool.image && (
                  <img
                    src={tool.image}
                    alt={`${tool.name} logo`}
                    className="w-12 h-12 object-contain mb-2"
                  />
                )}
                <h3 className="text-xl font-semibold text-accent-600 group-hover:text-white">
                  {tool.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{tool.description}</p>

                {/* Tags */}
                {tool.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tool.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-accent-500 text-white rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Optional Badges */}
                <div className="mt-2 flex gap-2">
                  {tool.openSource && (
                    <span className="text-xs px-2 py-1 bg-green-600 text-white rounded">Open Source</span>
                  )}
                  {tool.sustainable && (
                    <span className="text-xs px-2 py-1 bg-emerald-600 text-white rounded">Sustainable</span>
                  )}
                </div>
              </a>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}