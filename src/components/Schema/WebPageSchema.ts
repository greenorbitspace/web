export default function getWebPageSchema({
  url,
  title,
  description = "Green Orbit Digital is a sustainable marketing agency focused on the space sector, delivering SEO, digital strategy, and data-driven campaigns.",
  featuredImage = "https://greenorbit.space/logos/organisation/greenorbit.png", // confirm folder name
  datePublished = new Date().toISOString().split("T")[0],
  dateModified = new Date().toISOString().split("T")[0],
  breadcrumbs
}: WebPageSchemaProps) {
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

  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { "@id": "https://greenorbit.space/#website" },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: featuredImage,
      caption: title
    },
    about: { "@id": "https://greenorbit.space/about" },
    author: { "@type": "Organization", name: "Green Orbit Digital" },
    publisher: {
      "@type": "Organization",
      name: "Green Orbit Digital",
      logo: {
        "@type": "ImageObject",
        url: featuredImage
      }
    },
    datePublished,
    dateModified,
    inLanguage: "en-GB",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbList
    }
  };
}

export { WebPageSchemaProps };