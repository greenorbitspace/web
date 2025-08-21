import React, { useState, useMemo, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import slugify from '../utils/slugify.js';
import { UN_COUNTRIES } from '../data/unCountries.js';

// Robust date parser for ISO, DD/MM/YYYY, and fallback
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

function formatEventDate(date) {
  if (!date) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function detectCountry(location) {
  if (!location) return '';
  const loc = location.toLowerCase();
  return UN_COUNTRIES.find(c => loc.includes(c.toLowerCase())) || '';
}

export default function EventFilters({ events, batchSize = 6, flatList = false }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Process events: parse dates, slugify, extract country, etc.
  const processedEvents = useMemo(() =>
    events
      .map(e => {
        const startDate = parseEventDate(e.start);
        const endDate = parseEventDate(e.end);
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
        };
      })
      .filter(e => e.startDate && e.startDate >= today)
      .sort((a, b) => a.startDate - b.startDate),
    [events]
  );

  // Filters (skip if flatList)
  const categories = useMemo(() => Array.from(new Set(processedEvents.flatMap(e => e.categories))).sort(), [processedEvents]);
  const organizers = useMemo(() => Array.from(new Set(processedEvents.map(e => e.organizer))).sort(), [processedEvents]);
  const countries = useMemo(() => Array.from(new Set(processedEvents.map(e => e.country).filter(Boolean))).sort(), [processedEvents]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedOrganizer, setSelectedOrganizer] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const filteredEvents = useMemo(() =>
    processedEvents.filter(e =>
      (!selectedCategory || e.categories.map(c => c.toLowerCase()).includes(selectedCategory)) &&
      (!selectedOrganizer || e.organizer.toLowerCase() === selectedOrganizer) &&
      (!selectedCountry || e.country.toLowerCase() === selectedCountry)
    ),
    [processedEvents, selectedCategory, selectedOrganizer, selectedCountry]
  );

  // Infinite scroll (skip if flatList)
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const { ref: sentinelRef, inView } = useInView({ rootMargin: '200px', triggerOnce: false });

  useEffect(() => {
    if (!flatList && inView) {
      setVisibleCount(prev => Math.min(prev + batchSize, filteredEvents.length));
    }
  }, [inView, filteredEvents.length, batchSize, flatList]);

  useEffect(() => {
    if (!flatList) setVisibleCount(batchSize);
  }, [selectedCategory, selectedOrganizer, selectedCountry, batchSize, flatList]);

  const toggleFilter = (current, value, setter) => setter(current === value ? '' : value);

  const eventsToShow = flatList ? filteredEvents : filteredEvents.slice(0, visibleCount);

  // Group by month (skip if flatList)
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
      {/* Filters: hide if flatList */}
      {!flatList && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="border rounded px-2 py-1 text-primary-500">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
          </select>
          <select value={selectedOrganizer} onChange={e => setSelectedOrganizer(e.target.value)} className="border rounded px-2 py-1 text-primary-500">
            <option value="">All Organisers</option>
            {organizers.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
          </select>
          <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="border rounded px-2 py-1 text-primary-500">
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Events */}
      {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
        <section key={month} className="space-y-6">
          {!flatList && <h2 className="text-2xl font-bold">{month}</h2>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {monthEvents.map((e, idx) => (
              <div
                key={e.slug}
                className="border rounded-lg p-4 shadow-sm flex flex-col h-full transition-opacity duration-700"
                style={{ opacity: 1, animationDelay: `${idx * 0.1}s` }}
              >
                {e.image && <img src={e.image} alt={e.title} className="w-full h-48 object-cover rounded mb-4" />}
                <a href={`/events/${e.slug}`} className="text-lg font-semibold mb-1 hover:underline">{e.title}</a>
                <p className="text-sm text-accent-500 mb-1">
                  {formatEventDate(e.startDate)}{e.endDate ? ` - ${formatEventDate(e.endDate)}` : ''}
                </p>
                <p className="text-sm mb-2">{e.location}</p>

                <div className="flex flex-wrap gap-2 mb-2 items-center">
                  {e.categories.map(cat => (
                    <span key={cat} className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer ${selectedCategory === cat.toLowerCase() ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                      onClick={() => toggleFilter(selectedCategory, cat.toLowerCase(), setSelectedCategory)}>
                      {cat}
                    </span>
                  ))}
                  {e.organizer && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer ${selectedOrganizer === e.organizer.toLowerCase() ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                      onClick={() => toggleFilter(selectedOrganizer, e.organizer.toLowerCase(), setSelectedOrganizer)}>
                      {e.organizer}
                    </span>
                  )}
                  {e.country && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer ${selectedCountry === e.country.toLowerCase() ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                      onClick={() => toggleFilter(selectedCountry, e.country.toLowerCase(), setSelectedCountry)}>
                      {e.country}
                    </span>
                  )}
                </div>

                {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-block px-4 py-2 bg-accent-500 text-white rounded hover:bg-accent-600">View Event</a>}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Sentinel: hide if flatList */}
      {!flatList && visibleCount < filteredEvents.length && (
        <div ref={sentinelRef} style={{ height: '80px' }} className="text-center text-gray-500 bg-gray-100">
          Loading more events...
        </div>
      )}
    </div>
  );
}