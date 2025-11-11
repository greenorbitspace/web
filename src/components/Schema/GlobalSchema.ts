import organisations from "../../data/organisations.json";
import brands from "../../data/schema/brands.json";
import socials from "../../data/schema/socials.json";
import contact from "../../data/schema/contact.json";
import founders from "../../data/schema/founders.json";
import areas from "../../data/schema/areas.json";
import knowledge from "../../data/schema/knowledge.json";
import profiles from "../../data/schema/profiles.json";
import services from "../../data/schema/services.json";
import webpages from "../../data/schema/webpages.json";
import blog from "../../data/schema/blog.json";

export function getGlobalSchema() {
  const safeFounders = founders || [];
  const safeContact = contact || {};
  const safeAreas = areas || [];
  const safeKnowledge = knowledge || [];
  const safeBrands = brands || [];
  const safeServices = services || [];
  const safeWebpages = webpages || [];
  const safeBlog = blog || [];

  const memberOrgs = organisations
    .filter(org => ["member", "partner"].includes(org.Type))
    .map(org => ({
      "@type": "Organization",
      name: org.Organisation,
      url: org.URL,
      description: org.Description || undefined,
      logo: org.logo || undefined
    }));

  const flattenedProfiles = Object.values(profiles.profiles || {}).flat();
  const sameAsLinks = Array.from(
    new Set([
      ...socials.map(s => s?.url).filter(Boolean),
      ...flattenedProfiles.map(p => p?.url).filter(Boolean)
    ])
  );

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://greenorbit.space/#organization",
    name: "Green Orbit Digital",
    url: "https://greenorbit.space",
    logo: "https://greenorbit.space/images/logo.png",
    foundingDate: "2023-10-12",
    legalName: "Green Orbit Digital Ltd",
    description: "Green Orbit Digital is a Leicester-based agency specialising in sustainable marketing for the space sector.",
    slogan: "Sustainable marketing for the space sector.",
    founder: safeFounders.length ? safeFounders : undefined,
    contactPoint: safeContact.contactPoint?.length ? safeContact.contactPoint : undefined,
    address: Object.keys(safeContact.address || {}).length ? safeContact.address : undefined,
    geo: Object.keys(safeContact.geo || {}).length ? safeContact.geo : undefined,
    sameAs: sameAsLinks.length ? sameAsLinks : undefined,
    areaServed: safeAreas.length ? safeAreas : undefined,
    memberOf: memberOrgs.length ? memberOrgs : undefined,
    knowsAbout: safeKnowledge.length ? safeKnowledge : undefined,
    brand: safeBrands.length ? safeBrands : undefined,
    makesOffer: safeServices.length ? safeServices : undefined,
    hasPart: safeWebpages.length ? safeWebpages : undefined,
    publishes: safeBlog.length ? safeBlog : undefined,
    isAccessibleForFree: true
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Green Orbit Digital",
    url: "https://greenorbit.space",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://greenorbit.space/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return [orgSchema, websiteSchema];
}