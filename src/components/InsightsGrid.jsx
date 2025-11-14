import React from "react";
import { SDGs } from "../data/sdgs";
import organisationsData from "../data/organisations.json";

const fallbackIcon = "/sdgs/default.svg";
const fallbackImage = "/images/placeholder.jpg";

const sdgMap = SDGs.reduce((acc, sdg) => {
  const code = `SDG ${String(sdg.id).padStart(2, "0")}`;
  acc[code.toUpperCase()] = sdg;
  return acc;
}, {});

const orgMap = organisationsData.reduce((acc, org) => {
  acc[org.slug] = org;
  return acc;
}, {});

export default function InsightsGrid({ posts = [] }) {
  if (!posts.length) return <p className="text-accent-500 italic">No insights found.</p>;

  return (
    <ul className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full px-4 sm:px-6 lg:px-8">
      {posts.map((post) => {
        const {
          title,
          excerpt,
          date,
          tags = [],
          SDGs: postSDGs = [],
          organisations: postOrgs = [],
          featuredImage,
          slug,
          contentType,
          author: postAuthor = null,
        } = post;

        // Ensure author is an array for mapping
        const authorsArray = postAuthor
          ? Array.isArray(postAuthor)
            ? postAuthor
            : [postAuthor]
          : [];

        const sdgIcons = postSDGs.map((id) => {
          const code = `SDG ${String(id).padStart(2, "0")}`;
          const sdg = sdgMap[code.toUpperCase()];
          return sdg ? (
            <a
              key={code}
              href={`https://sdgs.greenorbit.space/${id}/`}
              target="_blank"
              rel="noopener noreferrer"
              title={sdg.name}
            >
              <img
                src={sdg.icon || fallbackIcon}
                alt={sdg.name}
                className="w-8 h-8 rounded-sm border border-gray-300/40 transition-transform hover:scale-110"
                loading="lazy"
              />
            </a>
          ) : null;
        }).filter(Boolean);

        const orgBadges = postOrgs.map((org) => (
          <a
            key={org.slug}
            href={`/organisations/${org.slug}`}
            className="bg-gray-300 dark:bg-accent-500 text-white hover:bg-primary-500 rounded-full px-3 py-1 text-xs font-medium capitalize"
          >
            {org.name}
          </a>
        ));

        return (
          <li
            key={slug}
            className="border border-accent-500 rounded-lg overflow-hidden hover:shadow-xl transition bg-white dark:bg-gray-800/40"
          >
            <a href={`/blog/${slug}`} className="block overflow-hidden rounded-t-lg">
              <img
                src={featuredImage || fallbackImage}
                alt={title}
                loading="lazy"
                className="w-full h-48 md:h-56 lg:h-64 object-cover object-center transition-transform duration-300 hover:scale-105"
              />
            </a>
            <div className="p-4 space-y-2">
              <a href={`/blog/${slug}`} className="block w-full">
                <h3 className="text-lg font-semibold bg-accent-500 text-white w-full px-3 py-2 rounded-md">
                  {title}
                </h3>
              </a>
              {date && <p className="text-sm text-white">{date}</p>}
              {excerpt && <p className="text-gray-700 dark:text-gray-300 text-sm">{excerpt}</p>}

              {authorsArray.length > 0 && (
                <p className="text-sm text-accent-500 mt-2">
                  By{" "}
                  {authorsArray.reduce(
                    (prev, curr, i) =>
                      i === 0 ? [curr.name] : [...prev, ", ", curr.name],
                    []
                  )}
                </p>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-accent-500 text-white text-xs px-2 py-1 rounded hover:bg-primary-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {orgBadges.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{orgBadges}</div>}

              {contentType && (
                <div className="mt-2">
                  <span className="inline-block bg-secondary-500 text-white text-xs px-2 py-1 rounded uppercase">
                    {contentType}
                  </span>
                </div>
              )}

              {sdgIcons.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{sdgIcons}</div>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}