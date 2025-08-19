import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { slugify } from '../utils/slugify';

// Helper functions
function parseEventDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date) ? null : date;
}

// Convert newline-separated text to React paragraphs
function FormattedDescription({ text }) {
  if (!text) return null;
  return (
    <div style={{ marginTop: '0.5em', fontSize: '0.85em', color: '#ddd' }}>
      {text.split(/\n\s*\n/).map((paragraph, i) => (
        <p key={i} style={{ marginBottom: '0.8em' }}>
          {paragraph.split('\n').map((line, j) => (
            <React.Fragment key={j}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}

// Normalize events
function normalizeEvents(rawEvents) {
  return rawEvents.map((e) => {
    const startDate = parseEventDate(e.start);
    const endDate = parseEventDate(e.end);
    const title = e.title || 'Untitled Event';
    const slug = e.slug || slugify(title);
    const url = e.url || e.registrationUrl || e.servicePage || '';
    return {
      title,
      start: startDate,
      end: endDate,
      extendedProps: {
        description: e.description || '',
        location: e.location && e.location !== '-' ? e.location : 'TBD',
        organizer: e.organizer || 'TBD',
        status: e.status || 'TBD',
        categories: e.categories || [],
        slug,
        servicePage: e.servicePage || '',
        registrationUrl: e.registrationUrl || '',
      },
      url,
    };
  });
}

export default function EventsCalendar({ events: rawEvents }) {
  const events = normalizeEvents(rawEvents);

  return (
    <>
      {/* FullCalendar CSS */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.8/main.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.8/main.min.css"
      />

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={false}
        events={events}
        eventClick={(info) => {
          const props = info.event.extendedProps;
          const url = props.slug
            ? `/events/${props.slug}/`
            : props.servicePage
            ? props.servicePage
            : props.registrationUrl;
          if (url) window.open(url, '_blank');
        }}
        eventContent={(info) => {
          const { title, extendedProps } = info.event;
          return (
            <div style={{ padding: '0.2em 0.4em' }}>
              <strong>{title}</strong>
              <FormattedDescription text={extendedProps.description} />
            </div>
          );
        }}
      />
    </>
  );
}