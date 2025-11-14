export interface AboutPageSchemaProps {
  siteUrl: string;
  aboutPageUrl: string;
  name: string;
  description: string;
  lastReviewed: string;
  mainContentSelector: string;
  primaryImageUrl: string;
  primaryImageCaption: string;
  founderName: string;
  founderTitle: string;
  founderUrl: string;
  founderSocials?: string[];
  address?: {
    street?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  email?: string;
  phone?: string;
  socials?: string[];
  specialties?: string[];
  relatedLinks?: string[];
  significantLinks?: string[];
  awards?: string[];
  memberOf?: { name: string; url: string };
  missionStatement?: string;
}

export const createAboutPageSchema = (props: AboutPageSchemaProps) => {
  const address = props.address ?? {};

  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: props.name,
    url: props.aboutPageUrl,
    headline: props.name,
    description: props.description,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: props.siteUrl },
        { "@type": "ListItem", position: 2, name: "About", item: props.aboutPageUrl }
      ]
    },
    lastReviewed: props.lastReviewed,
    mainContentOfPage: {
      "@type": "WebPageElement",
      cssSelector: props.mainContentSelector
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: props.primaryImageUrl,
      caption: props.primaryImageCaption
    },
    about: {
      "@type": "Organization",
      name: props.name,
      url: props.siteUrl,
      logo: `${props.siteUrl}/images/logo.svg`,
      founder: {
        "@type": "Person",
        name: props.founderName,
        jobTitle: props.founderTitle,
        url: props.founderUrl,
        sameAs: props.founderSocials ?? []
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: address.street ?? "",
        addressLocality: address.locality ?? "",
        addressRegion: address.region ?? "",
        postalCode: address.postalCode ?? "",
        addressCountry: address.country ?? ""
      },
      email: props.email ?? "",
      telephone: props.phone ?? "",
      sameAs: props.socials ?? [],
      slogan: props.name,
      missionStatement: props.missionStatement ?? "",
      award: props.awards ?? [],
      memberOf: props.memberOf ?? null,
      areaServed: { "@type": "AdministrativeArea", name: "United Kingdom and Europe" }
    },
    specialty: props.specialties ?? [],
    relatedLink: props.relatedLinks ?? [],
    significantLink: props.significantLinks ?? [],
    reviewedBy: {
      "@type": "Person",
      name: props.founderName,
      jobTitle: props.founderTitle,
      url: props.founderUrl
    },
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