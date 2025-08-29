import React, { useState, useMemo, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import slugify from '../utils/slugify.js';
import { UN_COUNTRIES } from '../data/unCountries.js';
import { SDGs } from '../data/sdgs';

const fallbackIcon = '/sdgs/default.svg';

// Map SDG IDs to metadata
const sdgMap = SDGs.reduce((acc, sdg) => {
  acc[sdg.id] = sdg;
  return acc;
}, {});

// Parse dates
function parseEventDate(dateStr) {
  if (!dateStr) return null;
  let date = new Date(dateStr);
  if (!isNaN(date)) return date;

  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    date = new Date(year, month - 1, day);
    if (!isNaN(date)) return date;
  }

  date = Date.parse(dateStr);
  return isNaN(date) ? null : new Date(date);
}

// Format dates
function formatEventDate(startDate, endDate) {
  if (!startDate) return '';
  if (!endDate || startDate.getTime() === endDate.getTime()) {
    return startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return `${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

// Detect country from location string
function detectCountry(location) {
  if (!location) return '';
  const countryAliases = {
    "uk": "United Kingdom", "u.k.": "United Kingdom", "united kingdom": "United Kingdom",
    "us": "United States", "u.s.": "United States", "usa": "United States",
    "eu": "European Union", "e.u.": "European Union",
  };
  for (const [alias, canonical] of Object.entries(countryAliases)) {
    if (new RegExp(`\\b${alias}\\b`, 'i').test(location)) return canonical;
  }
  for (const c of UN_COUNTRIES) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(location)) return c;
  }
  return '';
}

export default function EventFilters({ preRenderedEvents = [], batchSize = 6, flatList = false }) {
  const events = Array.isArray(preRenderedEvents) ? preRenderedEvents : [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Process events
  const processedEvents = useMemo(() =>
    events
      .map(e => {
        const startDate = parseEventDate(e.start);
        const endDate = parseEventDate(e.end);
        let mode = "in-person";
        if (e.mode) {
          mode = /online|virtual/i.test(e.mode) ? "online" : "in-person";
        } else if (e.location && /(online|virtual|zoom|teams|webinar)/i.test(e.location)) {
          mode = "online";
        }
        return {
          ...e,
          slug: e.slug || slugify(e.title),
          startDate,
          endDate,
          location: e.location && e.location !== '-' ? e.location : 'TBD',
          country: detectCountry(e.location),
          organizer: e.organizer || 'TBD',
          categories: e.categories || [],
          url: e.url || '',
          image: e.image || e.image_url || '',
          mode,
          sdgs: Array.isArray(e.sdgs) ? e.sdgs : [],
        };
      })
      .filter(e => e.startDate && e.startDate >= today)
      .sort((a, b) => a.startDate - b.startDate),
    [events]
  );

  // Unique filters
  const categories = useMemo(() => Array.from(new Set(processedEvents.flatMap(e => e.categories))).sort(), [processedEvents]);
  const organizers = useMemo(() => Array.from(new Set(processedEvents.map(e => e.organizer))).sort(), [processedEvents]);
  const countries = useMemo(() => Array.from(new Set(processedEvents.map(e => e.country).filter(Boolean))).sort(), [processedEvents]);
  const sdgCategories = useMemo(() => {
    const set = new Set();
    processedEvents.forEach(e => e.sdgs.forEach(id => set.add(id)));
    return ['All', ...Array.from(set).sort((a, b) => a - b)];
  }, [processedEvents]);

  // State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedOrganizer, setSelectedOrganizer] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedMode, setSelectedMode] = useState('both');
  const [selectedSDG, setSelectedSDG] = useState('All');

  const toggleFilter = (current, value, setter) => setter(current === value ? '' : value);

  const filteredEvents = useMemo(() =>
    processedEvents.filter(e => {
      const matchCategory = !selectedCategory || e.categories.map(c => c.toLowerCase()).includes(selectedCategory.toLowerCase());
      const matchOrganizer = !selectedOrganizer || e.organizer.toLowerCase() === selectedOrganizer.toLowerCase();
      const matchCountry = !selectedCountry || e.country.toLowerCase() === selectedCountry.toLowerCase();
      const matchMode = selectedMode === 'both' || e.mode === selectedMode;
      const matchSDG = selectedSDG === 'All' || e.sdgs.includes(selectedSDG);
      return matchCategory && matchOrganizer && matchCountry && matchMode && matchSDG;
    }),
    [processedEvents, selectedCategory, selectedOrganizer, selectedCountry, selectedMode, selectedSDG]
  );

  const [visibleCount, setVisibleCount] = useState(batchSize);
  const { ref: sentinelRef, inView } = useInView({ rootMargin: '200px', triggerOnce: false });

  useEffect(() => {
    if (!flatList && inView) setVisibleCount(prev => Math.min(prev + batchSize, filteredEvents.length));
  }, [inView, filteredEvents.length, batchSize, flatList]);

  useEffect(() => {
    if (!flatList) setVisibleCount(batchSize);
  }, [selectedCategory, selectedOrganizer, selectedCountry, selectedMode, selectedSDG, batchSize, flatList]);

  const eventsToShow = flatList ? filteredEvents : filteredEvents.slice(0, visibleCount);

  const eventsByMonth = useMemo(() => {
    if (flatList) return { all: eventsToShow };
    const grouped = {};
    eventsToShow.forEach(event => {
      const month = event.startDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(event);
    });
    return grouped;
  }, [eventsToShow, flatList]);

  return (
    <div className="space-y-8">
      {!flatList && (
        <>
          {/* SDG Filter */}
          <nav className="flex flex-wrap gap-2 mb-4 border-b pb-3 border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setSelectedSDG('All')}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
                selectedSDG === 'All' ? 'bg-accent-600 text-white shadow' : 'text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700'
              }`}
            >
              All SDGs
            </button>
            {sdgCategories.filter(id => id !== 'All').map(id => {
              const sdg = sdgMap[id];
              return (
                <button
                  key={id}
                  onClick={() => setSelectedSDG(id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md transition ${
                    selectedSDG === id ? 'bg-accent-600 text-white shadow' : 'text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700'
                  }`}
                >
                  <img src={sdg?.icon || fallbackIcon} alt={sdg?.name || `SDG ${id}`} className="w-10 h-10 rounded-sm border border-gray-300 dark:border-gray-600" />
                  <span className="sr-only">{sdg?.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="border rounded px-2 py-1 text-gray-700">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
            </select>
            <select value={selectedOrganizer} onChange={e => setSelectedOrganizer(e.target.value)} className="border rounded px-2 py-1 text-gray-700">
              <option value="">All Organisers</option>
              {organizers.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
            </select>
            <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="border rounded px-2 py-1 text-gray-700">
              <option value="">All Countries</option>
              {countries.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
            </select>
            <select value={selectedMode} onChange={e => setSelectedMode(e.target.value)} className="border rounded px-2 py-1 text-gray-700">
              <option value="both">Both</option>
              <option value="in-person">In-person</option>
              <option value="online">Online</option>
            </select>
          </div>
        </>
      )}

      {/* Event Cards */}
      {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
        <section key={month} className="space-y-6">
          {!flatList && <h2 className="text-2xl font-bold">{month}</h2>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {monthEvents.map(e => (
              <div key={e.slug} className="border rounded-lg p-4 shadow-sm flex flex-col h-full bg-white">
                {e.image && <img src={e.image} alt={e.title} className="w-full h-48 object-cover rounded mb-4" />}
                <a href={`/events/${e.slug}`} className="text-lg font-semibold mb-1 hover:underline text-primary-500">{e.title}</a>
                <p className="text-sm text-accent-500 mb-1">{formatEventDate(e.startDate, e.endDate)}</p>
                <p className="text-sm mb-2 text-secondary-500">{e.location}</p>

                {/* Clickable tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {e.categories.map(cat => (
                    <span key={cat} className="inline-block bg-accent-500 text-white text-xs px-2 py-1 rounded cursor-pointer" onClick={() => toggleFilter(selectedCategory, cat.toLowerCase(), setSelectedCategory)}>{cat}</span>
                  ))}
                  {e.organizer && <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded cursor-pointer" onClick={() => toggleFilter(selectedOrganizer, e.organizer.toLowerCase(), setSelectedOrganizer)}>{e.organizer}</span>}
                  {e.country && <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded cursor-pointer" onClick={() => toggleFilter(selectedCountry, e.country.toLowerCase(), setSelectedCountry)}>{e.country}</span>}
                  {e.mode && <span className="inline-block bg-purple-500 text-white text-xs px-2 py-1 rounded cursor-pointer" onClick={() => toggleFilter(selectedMode, e.mode, setSelectedMode)}>{e.mode === 'online' ? 'Online' : 'In-person'}</span>}
                </div>

                {/* SDG icons */}
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {e.sdgs.sort((a, b) => a - b).map(id => {
                    const sdg = sdgMap[id];
                    return <img key={id} src={sdg?.icon || fallbackIcon} alt={sdg?.name || `SDG ${id}`} className="w-6 h-6 rounded-sm cursor-pointer" onClick={() => setSelectedSDG(id)} />;
                  })}
                </div>

                {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-block px-4 py-2 bg-accent-500 text-white rounded hover:bg-accent-600">View Event</a>}
              </div>
            ))}
          </div>
        </section>
      ))}

      {!flatList && visibleCount < filteredEvents.length && <div ref={sentinelRef} style={{ height: '80px' }} className="text-center text-gray-500">Loading more events...</div>}
    </div>
  );
}