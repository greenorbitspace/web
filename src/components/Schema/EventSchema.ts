// src/utils/EventSchema.ts
import { SDGs } from '../../data/sdgs';

export interface Event {
  slug: string;
  title: string;
  description: string;
  start?: string;
  end?: string;
  location?: string;
  organizer?: string;
  organizer_url?: string;
  status?: string;
  categories?: string[];
  tags?: string[];
  url?: string;
  image?: string;
  calendar_links?: { label: string; url: string }[];
  sdgs?: number[];
  price?: number;
  currency?: string;
}

const fallbackIcon = '/sdgs/default.svg';

// Map SDG IDs to metadata
const sdgMap = SDGs.reduce<Record<number, typeof SDGs[0]>>((acc, sdg) => {
  acc[sdg.id] = sdg;
  return acc;
}, {});

export function buildEventSchema(event: Event) {
  if (!event) return null;

  let locationSchema;
  if (!event.location || event.location === 'TBD') {
    locationSchema = undefined;
  } else if (event.location.toLowerCase().includes('online')) {
    locationSchema = {
      "@type": "VirtualLocation",
      url: event.url || undefined,
    };
  } else {
    locationSchema = {
      "@type": "Place",
      name: event.location,
      address: event.location,
    };
  }

  const offersSchema = event.price
    ? {
        "@type": "Offer",
        url: event.url,
        price: event.price,
        priceCurrency: event.currency || 'GBP',
        availability: "https://schema.org/InStock",
        validFrom: event.start,
      }
    : undefined;

  const performerSchema = event.organizer
    ? {
        "@type": "Organization",
        name: event.organizer,
        url: event.organizer_url || undefined,
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.start,
    endDate: event.end || event.start,
    eventStatus: `https://schema.org/${event.status || 'EventScheduled'}`,
    url: event.url,
    image: event.image,
    location: locationSchema,
    performer: performerSchema,
    offers: offersSchema,
    keywords: [
      ...(event.categories || []),
      ...(event.tags || event.categories || []),
      ...(event.sdgs?.map(id => sdgMap[id]?.name || `SDG ${id}`) || []),
    ].filter(Boolean),
    about: event.sdgs?.length
      ? event.sdgs.map(id => ({
          "@type": "Thing",
          name: sdgMap[id]?.name || `SDG ${id}`,
          url: `/events/?sdg=${id}`,
        }))
      : undefined,
    isAccessibleForFree: true,
  };
}

export { fallbackIcon, sdgMap };