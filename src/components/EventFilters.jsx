import React, { useState, useMemo } from 'react';
import slugify from '../utils/slugify.js';

const UN_COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia",
  "Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium",
  "Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria",
  "Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad",
  "Chile","China","Colombia","Comoros","Congo","Costa Rica","Côte d’Ivoire","Croatia","Cuba","Cyprus",
  "Czechia","Czech Republic", "Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador",
  "Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France",
  "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
  "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica",
  "Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho",
  "Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali",
  "Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia",
  "Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua",
  "Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama",
  "Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda",
  "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe",
  "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands",
  "Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland",
  "Syria","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey",
  "Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay",
  "Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

function parseEventDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date) ? null : date;
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

export default function EventFilters({ events }) {
  const today = new Date();

  const upcomingEvents = useMemo(() =>
    events
      .map(e => ({
        ...e,
        slug: e.slug || slugify(e.title),
        startDate: parseEventDate(e.start),
        endDate: parseEventDate(e.end),
        location: e.location && e.location !== '-' ? e.location : 'TBD',
        country: detectCountry(e.location),
        organizer: e.organizer || 'TBD',
        categories: e.categories || [],
        url: e.url || '',
        image: e.image || e.image_url || '',
      }))
      .filter(e => e.startDate && e.startDate >= today)
      .sort((a, b) => a.startDate - b.startDate),
    [events]
  );

  // Filter options
  const categories = useMemo(() => Array.from(new Set(upcomingEvents.flatMap(e => e.categories))).sort(), [upcomingEvents]);
  const organizers = useMemo(() => Array.from(new Set(upcomingEvents.map(e => e.organizer))).sort(), [upcomingEvents]);
  const countries = useMemo(() => Array.from(new Set(upcomingEvents.map(e => e.country).filter(Boolean))).sort(), [upcomingEvents]);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedOrganizer, setSelectedOrganizer] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const filteredEvents = useMemo(() =>
    upcomingEvents.filter(e =>
      (!selectedCategory || e.categories.map(c => c.toLowerCase()).includes(selectedCategory)) &&
      (!selectedOrganizer || e.organizer.toLowerCase() === selectedOrganizer) &&
      (!selectedCountry || e.country.toLowerCase() === selectedCountry)
    ),
    [upcomingEvents, selectedCategory, selectedOrganizer, selectedCountry]
  );

  const eventsByMonth = useMemo(() => {
    const grouped = {};
    filteredEvents.forEach(event => {
      const month = event.startDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  const toggleFilter = (current, value, setter) => setter(current === value ? '' : value);

  return (
    <div className="space-y-8">
      {/* Top Dropdown Filters */}
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

      {/* Events grouped by month */}
      {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
        <section key={month} className="space-y-6">
          <h2 className="text-2xl font-bold">{month}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {monthEvents.map(e => (
              <div key={e.slug} className="border rounded-lg p-4 shadow-sm flex flex-col h-full">
                {e.image && <img src={e.image} alt={e.title} className="w-full h-48 object-cover rounded mb-4" />}

                {/* Clickable title */}
                <a href={`/events/${e.slug}`} className="text-lg font-semibold mb-1 hover:underline">{e.title}</a>

                <p className="text-sm text-accent-500 mb-1">{formatEventDate(e.startDate)}{e.endDate ? ` - ${formatEventDate(e.endDate)}` : ''}</p>
                <p className="text-sm mb-2">{e.location}</p>

                {/* Clickable pills inside cards */}
                <div className="flex flex-wrap gap-2 mb-2 items-center">
                  {e.categories.map(cat => {
                    const active = selectedCategory === cat.toLowerCase();
                    return (
                      <span
                        key={cat}
                        className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer ${
                          active ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                        onClick={() => toggleFilter(selectedCategory, cat.toLowerCase(), setSelectedCategory)}
                      >
                        {cat}
                      </span>
                    );
                  })}
                  {e.organizer && (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer ${
                        selectedOrganizer === e.organizer.toLowerCase() ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                      onClick={() => toggleFilter(selectedOrganizer, e.organizer.toLowerCase(), setSelectedOrganizer)}
                    >
                      {e.organizer}
                    </span>
                  )}
                  {e.country && (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer ${
                        selectedCountry === e.country.toLowerCase() ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                      onClick={() => toggleFilter(selectedCountry, e.country.toLowerCase(), setSelectedCountry)}
                    >
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
    </div>
  );
}