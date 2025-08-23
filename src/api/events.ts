import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

const API_KEY = process.env.TICKETTAILOR_API_KEY;
const BASE_URL = 'https://api.tickettailor.com/v1';
const CACHE_FILE = path.resolve('./src/data/events-cache.json');

async function fetchEventsFromAPI() {
  const res = await fetch(`${BASE_URL}/events.json`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  const data = await res.json();
  return data.events || [];
}

async function fetchTickets(eventId: string) {
  const res = await fetch(`${BASE_URL}/events/${eventId}/tickets.json`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  const data = await res.json();
  return data.tickets || [];
}

async function transformEvents(eventsRaw: any[]) {
  const events = [];
  for (const e of eventsRaw) {
    const ticketsRaw = await fetchTickets(e.id);
    const tickets = ticketsRaw.map(t => ({
      ticketId: t.id,
      type: t.name,
      price: parseFloat(t.price),
      currency: t.currency || 'GBP',
      available: t.quantity_available,
      buyUrl: t.url,
    }));

    events.push({
      eventId: e.id,
      name: e.name,
      slug: e.slug,
      description: e.description,
      startDate: e.start_at,
      endDate: e.end_at,
      location: {
        venue: e.venue_name,
        address: e.venue_address,
        mapUrl: e.map_url || '',
      },
      tickets,
      attendeesCount: e.attendees_count,
      category: e.category || '',
      tags: e.tags || [],
      eventUrl: e.url,
    });
  }
  return events;
}

export const get: APIRoute = async () => {
  try {
    let eventsRaw = await fetchEventsFromAPI();
    let events = await transformEvents(eventsRaw);

    // Update cache
    await fs.writeFile(CACHE_FILE, JSON.stringify(events, null, 2));

    return new Response(JSON.stringify(events), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('API fetch failed, using cached events', err);
    try {
      const cached = await fs.readFile(CACHE_FILE, 'utf-8');
      return new Response(cached, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (cacheErr) {
      console.error('Cache read failed', cacheErr);
      return new Response(JSON.stringify({ error: 'Failed to fetch events' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
};