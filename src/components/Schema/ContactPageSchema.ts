export interface ContactPageSchemaProps {
  siteUrl: string;
  contactPageUrl: string;
  name: string;
  description: string;
  lastReviewed: string;
  mainContentSelector: string;
  primaryImageUrl?: string;
  primaryImageCaption?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    street?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  socials?: string[];
  mapUrl?: string; // optional link to a map or location
}

export const createContactPageSchema = (props: ContactPageSchemaProps) => {
  const address = props.address ?? {};

  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: props.name,
    url: props.contactPageUrl,
    headline: `Contact ${props.name}`,
    description: props.description,
    lastReviewed: props.lastReviewed,
    mainContentOfPage: {
      "@type": "WebPageElement",
      cssSelector: props.mainContentSelector
    },
    primaryImageOfPage: props.primaryImageUrl
      ? { "@type": "ImageObject", url: props.primaryImageUrl, caption: props.primaryImageCaption ?? "" }
      : undefined,
    about: {
      "@type": "Organization",
      name: props.name,
      url: props.siteUrl,
      logo: `${props.siteUrl}/images/logo.svg`,
      address: {
        "@type": "PostalAddress",
        streetAddress: address.street ?? "",
        addressLocality: address.locality ?? "",
        addressRegion: address.region ?? "",
        postalCode: address.postalCode ?? "",
        addressCountry: address.country ?? ""
      },
      email: props.contactEmail ?? "",
      telephone: props.contactPhone ?? "",
      sameAs: props.socials ?? [],
      areaServed: { "@type": "AdministrativeArea", name: "United Kingdom and Europe" }
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: props.contactEmail ?? "",
      telephone: props.contactPhone ?? "",
      contactType: "customer support",
      areaServed: "GB"
    },
    map: props.mapUrl ? { "@type": "Map", url: props.mapUrl } : undefined,
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: props.name,
      url: props.siteUrl,
      logo: `${props.siteUrl}/images/logo.svg`
    },
    inLanguage: "en-GB"
  };
};