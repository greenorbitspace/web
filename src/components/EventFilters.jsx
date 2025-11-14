import React, { useState, useMemo, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import slugify from '../utils/slugify.js';
import { UN_COUNTRIES } from '../data/unCountries.js';
import { SDGs } from '../data/sdgs';

const fallbackIcon = '/sdgs/default.svg';

const sdgMap = SDGs.reduce((acc, sdg) => {
  acc[sdg.id] = sdg;
  return acc;
}, {});

const parseEventDate = dateStr => {
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
};

const formatEventDate = (startDate, endDate) => {
  if (!startDate) return '';
  if (!endDate || startDate.getTime() === endDate.getTime()) {
    return startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return `${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

const detectCountry = location => {
  if (!location) return '';
  const countryAliases = {
    uk: 'United Kingdom',
    'u.k.': 'United Kingdom',
    'united kingdom': 'United Kingdom',
    us: 'United States',
    'u.s.': 'United States',
    usa: 'United States',
    eu: 'European Union',
    'e.u.': 'European Union',
  };
  for (const [alias, canonical] of Object.entries(countryAliases)) {
    if (new RegExp(`\\b${alias}\\b`, 'i').test(location)) return canonical;
  }
  for (const c of UN_COUNTRIES) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(location)) return c;
  }
  return '';
};

const CATEGORY_GROUPS = {
  'sustainability': ['climate', 'energy', 'environment', 'sustainable development'],
  'health & wellbeing': ['health', 'wellbeing', 'mental health', 'adhd', 'medical'],
  'space & tech': ['space', 'technology', 'innovation', 'aerospace'],
  'education & skills': ['education', 'training', 'skills', 'learning'],
  'policy & governance': ['policy', 'government', 'regulation', 'legislation'],
};

const getCategoryGroup = category => {
  const cat = category.toLowerCase();
  for (const [group, keywords] of Object.entries(CATEGORY_GROUPS)) {
    if (keywords.includes(cat)) return group;
  }
  return 'other';
};

export default function EventFilters({ preRenderedEvents = [], batchSize = 6, flatList = false }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events = Array.isArray(preRenderedEvents) ? preRenderedEvents : [];

  const processedEvents = useMemo(() => {
    return events
      .map(e => {
        const startDate = parseEventDate(e.start);
        const endDate = parseEventDate(e.end);
        let mode = 'in-person';
        if (e.mode) mode = /online|virtual/i.test(e.mode) ? 'online' : 'in-person';
        else if (e.location && /(online|virtual|zoom|teams|webinar)/i.test(e.location)) mode = 'online';

        const organizers = (e.organizer || 'TBD').split(',').map(o => o.trim());

        return {
          ...e,
          slug: e.slug || slugify(e.title),
          startDate,
          endDate,
          location: e.location && e.location !== '-' ? e.location : 'TBD',
          country: detectCountry(e.location),
          organizers,
          categories: (e.categories || []).map(c => c.toLowerCase().trim()),
          url: e.url || '',
          image: e.image || e.image_url || '',
          mode,
          sdgs: Array.isArray(e.sdgs) ? e.sdgs : [],
        };
      })
      .filter(e => e.startDate && e.startDate >= today)
      .sort((a, b) => a.startDate - b.startDate);
  }, [events]);

  const categories = useMemo(() => {
    const allCats = processedEvents.flatMap(e => e.categories);
    return Array.from(new Set(allCats)).sort();
  }, [processedEvents]);

  const categoryGroups = useMemo(() => {
    const grouped = {};
    categories.forEach(cat => {
      const group = getCategoryGroup(cat);
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(cat);
    });
    return grouped;
  }, [categories]);

  const organizers = useMemo(() => {
    const allOrgs = processedEvents.flatMap(e => e.organizers);
    return Array.from(new Set(allOrgs)).sort();
  }, [processedEvents]);

  const countries = useMemo(() => Array.from(new Set(processedEvents.map(e => e.country).filter(Boolean))).sort(), [processedEvents]);

  const sdgCategories = useMemo(() => {
    const set = new Set();
    processedEvents.forEach(e => e.sdgs.forEach(id => set.add(id)));
    return ['All', ...Array.from(set).sort((a, b) => a - b)];
  }, [processedEvents]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedOrganizer, setSelectedOrganizer] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedMode, setSelectedMode] = useState('both');
  const [selectedSDG, setSelectedSDG] = useState('All');
  const [startFilter, setStartFilter] = useState('');
  const [endFilter, setEndFilter] = useState('');

  const toggleFilter = (current, value, setter) => setter(current === value ? '' : value);

  const filteredEvents = useMemo(() => {
    return processedEvents.filter(e => {
      const matchCategory = !selectedCategory || e.categories.includes(selectedCategory);
      const matchOrganizer = !selectedOrganizer || e.organizers.some(o => o.toLowerCase() === selectedOrganizer.toLowerCase());
      const matchCountry = !selectedCountry || e.country.toLowerCase() === selectedCountry.toLowerCase();
      const matchMode = selectedMode === 'both' || e.mode === selectedMode;
      const matchSDG = selectedSDG === 'All' || e.sdgs.includes(selectedSDG);
      const matchStart = !startFilter || e.startDate >= new Date(startFilter);
      const matchEnd = !endFilter || e.endDate <= new Date(endFilter);
      return matchCategory && matchOrganizer && matchCountry && matchMode && matchSDG && matchStart && matchEnd;
    });
  }, [processedEvents, selectedCategory, selectedOrganizer, selectedCountry, selectedMode, selectedSDG, startFilter, endFilter]);

  const [visibleCount, setVisibleCount] = useState(batchSize);
  const { ref: sentinelRef, inView } = useInView({ rootMargin: '200px', triggerOnce: false });

  useEffect(() => {
    if (!flatList && inView) setVisibleCount(prev => Math.min(prev + batchSize, filteredEvents.length));
  }, [inView, filteredEvents.length, batchSize, flatList]);

  useEffect(() => {
    if (!flatList) setVisibleCount(batchSize);
  }, [selectedCategory, selectedOrganizer, selectedCountry, selectedMode, selectedSDG, startFilter, endFilter, batchSize, flatList]);

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
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="border rounded px-2 py-1 text-gray-700">
          <option value="">All Categories</option>
          {Object.entries(categoryGroups).map(([group, cats]) => (
            <optgroup key={group} label={group}>
              {cats.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </optgroup>
          ))}
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
          <option value="both">Format</option>
          <option value="in-person">In-person</option>
          <option value="online">Online</option>
        </select>

        <input type="date" value={startFilter} onChange={e => setStartFilter(e.target.value)} className="border rounded px-2 py-1 text-gray-800 bg-white" />
        <input type="date" value={endFilter} onChange={e => setEndFilter(e.target.value)} className="border rounded px-2 py-1 text-gray-800 bg-white" />
      </div>

      {/* SDG Filter */}
      <nav className="flex flex-wrap gap-2 mb-4 border-b pb-3 border-accent-500 dark:border-accent-500">
        <button onClick={() => setSelectedSDG('All')} className={`px-4 py-2 text-sm font-medium rounded-t-md ${selectedSDG === 'All' ? 'bg-accent-600 text-white' : 'text-gray-700 hover:bg-accent-100'}`}>All SDGs</button>
        {sdgCategories.filter(id => id !== 'All').map(id => {
          const sdg = sdgMap[id];
          return (
            <button key={id} onClick={() => setSelectedSDG(id)} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md ${selectedSDG === id ? 'bg-accent-600 text-white' : 'text-gray-700 hover:bg-accent-100'}`}>
              <img src={sdg?.icon || fallbackIcon} alt={sdg?.name || `SDG ${id}`} className="w-8 h-8 rounded-sm" />
              <span className="sr-only">{sdg?.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Event Cards */}
      {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
        <section key={month} className="space-y-6">
          {!flatList && <h2 className="text-2xl font-bold text-white">{month}</h2>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {monthEvents.map(e => (
              <div key={e.slug} className="border rounded-lg p-4 shadow-sm flex flex-col h-full bg-white">
                {e.image && <img src={e.image} alt={e.title} className="w-full h-48 object-cover rounded mb-4" />}
                <a href={`/events/${e.slug}`} className="text-lg font-semibold mb-1 hover:underline text-primary-500">{e.title}</a>
                <p className="text-sm text-accent-500 mb-1">{formatEventDate(e.startDate, e.endDate)}</p>
                <p className="text-sm mb-2 text-secondary-500">{e.location}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {e.categories.map(cat => (
                    <span key={cat} className="inline-block bg-accent-500 text-white text-xs px-2 py-1 rounded cursor-pointer" onClick={() => toggleFilter(selectedCategory, cat, setSelectedCategory)}>{cat}</span>
                  ))}
                  {e.organizers.map(org => (
                    <span key={org} className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded cursor-pointer" onClick={() => toggleFilter(selectedOrganizer, org.toLowerCase(), setSelectedOrganizer)}>{org}</span>
                  ))}
                  {e.country && <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded cursor-pointer" onClick={() => toggleFilter(selectedCountry, e.country.toLowerCase(), setSelectedCountry)}>{e.country}</span>}
                  {e.mode && <span className="inline-block bg-purple-500 text-white text-xs px-2 py-1 rounded cursor-pointer" onClick={() => toggleFilter(selectedMode, e.mode, setSelectedMode)}>{e.mode === 'online' ? 'Online' : 'In-person'}</span>}
                </div>
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {e.sdgs.sort((a,b)=>a-b).map(id => {
                    const sdg = sdgMap[id];
                    return <img key={id} src={sdg?.icon || fallbackIcon} alt={sdg?.name || `SDG ${id}`} className="w-6 h-6 rounded-sm cursor-pointer" onClick={() => setSelectedSDG(id)} />
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