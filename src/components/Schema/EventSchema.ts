// src/components/Schema/EventSchema.ts
import events from "../../data/events.json";

export interface EventSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  url: string;
  location?: {
    "@type": string;
    name?: string;
    address?: string;
    sameAs?: string;
  };
  image?: string;
  organizer?: {
    "@type": string;
    name: string;
    url?: string;
  }[];
  eventStatus?: string;
  inLanguage?: string;
  isAccessibleForFree?: boolean;
  audience?: string;
}

export function getEventSchema(): EventSchema[] {
  return events.map((event) => {
    const schema: EventSchema = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description: event.description,
      startDate: event.start,
      endDate: event.end || undefined,
      url: event.url,
      image: event.image_url || undefined,
      organizer: event.organizer
        ? event.organizer.split(",").map((org) => ({
            "@type": "Organization",
            name: org.trim(),
          }))
        : undefined,
      location: event.location
        ? event.location.toLowerCase() === "online"
          ? { "@type": "VirtualLocation", name: "Online" }
          : { "@type": "Place", name: event.location }
        : undefined,
      eventStatus:
        event.status === "CONFIRMED"
          ? "https://schema.org/EventScheduled"
          : "https://schema.org/EventCancelled",
      isAccessibleForFree: true,
    };

    return schema;
  });
}