import certifications from '../../data/schema/certifications.json' assert { type: 'json' };

export function getCertificationsSchema() {
  const items = certifications.map((cert, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": cert.awarded_to ? "Person" : "Organization",
      "name": cert.awarded_to || "Green Orbit Digital",
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "name": cert.name,
        "credentialCategory": cert.category,
        "description": cert.description,
        "url": cert.url,
        "issuedBy": {
          "@type": "Organization",
          "name": cert.issuer
        },
        "dateIssued": cert.year_awarded
          ? `${cert.year_awarded}-01-01`
          : undefined
      }
    }
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Green Orbit Digital Certifications",
    "description":
      "Certifications and professional accreditations demonstrating the commitment of Green Orbit Digital and its team to sustainability and excellence.",
    "url": "https://greenorbit.space/about/certifications",
    "itemListElement": items
  };
}