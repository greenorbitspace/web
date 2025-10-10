import React, { useState, useMemo } from 'react';
import { SDGs } from '../data/sdgs';

const fallbackIcon = '/sdgs/default.svg';
const fallbackImage = '/images/placeholder.jpg';

const sdgMap = SDGs.reduce((acc, sdg) => {
  const code = `SDG ${String(sdg.id).padStart(2, '0')}`;
  acc[code.toUpperCase()] = sdg;
  return acc;
}, {});

export default function TrainingList({ trainings = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSDG, setActiveSDG] = useState('All');

  const sdgCategories = useMemo(() => {
    const set = new Set();
    trainings.forEach(training => {
      const sdgs = training.data?.SDGs ?? [];
      const sdgArray = Array.isArray(sdgs) ? sdgs : [sdgs];
      sdgArray.forEach(id => id != null && set.add(`SDG ${String(id).padStart(2, '0')}`));
    });
    return ['All', ...Array.from(set).sort()];
  }, [trainings]);

  const filteredTrainings = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return trainings.filter(training => {
      const data = training.data ?? {};
      const title = (data.title ?? '').toLowerCase();
      const excerpt = (data.excerpt ?? '').toLowerCase();
      const tags = data.tags ?? [];

      const sdgCodes = Array.isArray(data.SDGs)
        ? data.SDGs.map(id => `SDG ${String(id).padStart(2, '0')}`)
        : typeof data.SDGs === 'number'
        ? [`SDG ${String(data.SDGs).padStart(2, '0')}`]
        : [];

      const matchesSDG = activeSDG === 'All' || sdgCodes.includes(activeSDG);
      const matchesSearch =
        title.includes(term) || excerpt.includes(term) || tags.some(tag => tag.toLowerCase().includes(term));

      return matchesSDG && matchesSearch;
    });
  }, [searchTerm, activeSDG, trainings]);

  return (
    <div className="space-y-6">

      {/* SDG Filter */}
      <nav className="flex flex-wrap gap-2 border-b pb-3 border-gray-300 dark:border-gray-600">
        <button
          onClick={() => setActiveSDG('All')}
          className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
            activeSDG === 'All' ? 'bg-accent-600 text-white shadow' : 'text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700'
          }`}
        >
          All SDGs
        </button>
        {sdgCategories.filter(code => code !== 'All').map(code => {
          const sdg = sdgMap[code.toUpperCase()];
          return (
            <button
              key={code}
              onClick={() => setActiveSDG(code)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md transition ${
                activeSDG === code ? 'bg-accent-600 text-white shadow' : 'text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700'
              }`}
            >
              <img src={sdg?.icon || fallbackIcon} alt={sdg?.name || code} className="w-10 h-10 rounded-sm border border-gray-300 dark:border-gray-600" />
              <span className="sr-only">{sdg?.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Search Input */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Training Workshops</h2>
        <input
          type="text"
          placeholder="Search trainings..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-sm"
        />
      </div>

      {/* Training List */}
      <ul className="space-y-6">
        {filteredTrainings.length === 0 ? (
          <li className="text-accent-500 italic">No trainings found.</li>
        ) : (
          filteredTrainings.map(training => {
            const { 
              title, 
              excerpt, 
              tags = [], 
              organisations = [], 
              SDGs = [], 
              featuredImage, 
            } = training.data ?? {};

            const sdgIcons = (Array.isArray(SDGs) ? SDGs : [SDGs]).filter(Boolean).map(id => {
              const code = `SDG ${String(id).padStart(2, '0')}`;
              const sdg = sdgMap[code.toUpperCase()];
              return (
                <a key={code} href={`https://sdgs.greenorbit.space/${id}/`} target="_blank" rel="noopener noreferrer">
                  <img src={sdg?.icon || fallbackIcon} alt={sdg?.name || code} className="w-8 h-8 rounded-sm border border-gray-300 dark:border-gray-600" />
                </a>
              );
            });

            return (
              <li key={training.slug} className="border border-accent-500 rounded overflow-hidden hover:shadow-md transition">
                <div className="p-4 space-y-2 flex flex-col lg:flex-row gap-4">
                  <img src={featuredImage || fallbackImage} alt={title} className="w-full lg:w-48 h-48 object-cover rounded-md border border-gray-300 dark:border-gray-600" />

                  <div className="flex-1 space-y-2">
                    <a href={`/training/${training.slug}`} className="block group-hover:text-white">
                      <h3 className="text-xl text-accent-500 font-semibold group-hover:underline">{title}</h3>
                    </a>

                    {excerpt && <p className="text-gray-700 dark:text-gray-300 text-sm">{excerpt}</p>}

                    {organisations.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {organisations.map(org => (
                          <span key={org} className="bg-gray-300 dark:bg-accent-500 text-white rounded-full px-3 py-1 text-xs font-medium capitalize">{org}</span>
                        ))}
                      </div>
                    )}

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map(tag => (
                          <span key={tag} className="inline-block bg-accent-500 text-white text-xs px-2 py-1 rounded">#{tag}</span>
                        ))}
                      </div>
                    )}

                    {sdgIcons.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{sdgIcons}</div>}
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}