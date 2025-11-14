import { WebPageSchemaProps } from "./WebPageSchema";

export interface WebsiteSchemaProps {
  url: string;
  title: string;
  description?: string;
  featuredImage?: string;
  datePublished?: string;
  dateModified?: string;
  breadcrumbs?: { name: string; url: string }[];
}

/**
 * Returns full Website JSON-LD object including LocalBusiness node
 */
export default function getWebsiteSchema({
  url,
  title,
  description = "Green Orbit Digital is a sustainable marketing agency focused on the space sector, delivering SEO, digital strategy, and data-driven campaigns.",
  featuredImage = "https://greenorbit.space/logos/organisations/greenorbit.png",
  datePublished = "2023-10-12",
  dateModified = new Date().toISOString().split("T")[0],
  breadcrumbs
}: WebsiteSchemaProps) {
  const breadcrumbList = breadcrumbs?.length
    ? breadcrumbs.map((bc, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: bc.name,
        item: bc.url
      }))
    : [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://greenorbit.space"
        }
      ];

  const baseOrganization = {
    "@type": "Organization",
    "@id": "https://greenorbit.space/#organization",
    name: "Green Orbit Digital",
    legalName: "Green Orbit Digital Ltd",
    url: "https://greenorbit.space",
    logo: { "@id": "https://greenorbit.space/#logo" },
    image: "https://greenorbit.space/favicon.svg",
    description: "A sustainable marketing agency specialising in the space sector, delivering SEO, digital strategy, and data-driven campaigns aligned to environmental best practices.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Leicester",
      addressLocality: "Leicester",
      postalCode: "LE4 5NU",
      addressCountry: "GB"
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "hello@greenorbit.space",
        telephone: "+44 116 4830155",
        availableLanguage: ["en"]
      }
    ],
    sameAs: [
      "https://www.linkedin.com/company/greenorbitdigital/",
      "https://x.com/greenorbitspace",
      "https://www.instagram.com/greenorbitspace/"
    ]
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://greenorbit.space/#website",
        url: "https://greenorbit.space",
        name: "Green Orbit Digital",
        alternateName: "Green Orbit Digital Ltd",
        publisher: { "@id": baseOrganization["@id"] },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://greenorbit.space/?s={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      baseOrganization,
      {
        "@type": "LocalBusiness",
        "@id": "https://greenorbit.space/#localbusiness",
        name: "Green Orbit Digital",
        url: "https://greenorbit.space",
        image: featuredImage,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Leicester",
          addressRegion: "Leicestershire",
          addressCountry: "GB"
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 52.6369,
          longitude: -1.1398
        },
        openingHours: "Mo-Fr 09:00-17:00",
        parentOrganization: { "@id": baseOrganization["@id"] }
      },
      {
        "@type": "ImageObject",
        "@id": "https://greenorbit.space/#logo",
        url: "https://greenorbit.space/logos/organisations/greenorbit.png",
        caption: "Green Orbit Digital Logo"
      }
    ]
  };
}

export { getWebsiteSchema, WebsiteSchemaProps };