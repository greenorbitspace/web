import React from "react";
import { SDGs } from "../data/sdgs";
import organisationsData from "../data/organisations.json";

const fallbackIcon = "/sdgs/default.svg";
const fallbackImage = "/images/placeholder.jpg";

// Map SDGs for quick lookup
const sdgMap = SDGs.reduce((acc, sdg) => {
  const code = `SDG ${String(sdg.id).padStart(2, "0")}`;
  acc[code.toUpperCase()] = sdg;
  return acc;
}, {});

// Map organisations by slug
const orgMap = organisationsData.reduce((acc, org) => {
  acc[org.slug] = org;
  return acc;
}, {});

export default function InsightsGrid({ posts = [] }) {
  if (!posts.length) {
    return <p className="text-accent-500 italic">No insights found.</p>;
  }

  return (
    <ul className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
      {posts.map((post) => {
        const data = post.data ?? {};
        const collection = post.collection ?? "blog";

        // Fallback slug logic
        const slug = data.slug ?? post.slug ?? post.id ?? "untitled";

        const title = data.title ?? "(Untitled)";
        const excerpt = data.excerpt ?? data.description ?? "";
        const date = data.pubdate ?? null;
        const tags = data.tags ?? [];
        const postSDGs = data.SDGs ?? [];
        const postOrgs = data.organisations ?? [];
        const featuredImage = data.featuredImage ?? fallbackImage;
        const contentType = data.contentType ?? collection;
        const postAuthor = data.author ?? null;

        const authorsArray = postAuthor
          ? Array.isArray(postAuthor)
            ? postAuthor
            : [postAuthor]
          : [];

        // SDG icons
        const sdgIcons = postSDGs
          .map((id) => {
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
          })
          .filter(Boolean);

        // Organisation badges
        const orgBadges = postOrgs
          .map((org) => {
            const orgSlug = org.slug ?? orgMap[org]?.slug ?? org;
            const orgName = org.name ?? org;
            return (
              <a
                key={orgSlug}
                href={`/organisations/${orgSlug}`}
                className="bg-gray-300 dark:bg-accent-500 text-white hover:bg-primary-500 rounded-full px-3 py-1 text-xs font-medium capitalize"
              >
                {orgName}
              </a>
            );
          })
          .filter(Boolean);

        return (
          <li
            key={slug}
            className="border border-accent-500 rounded-lg overflow-hidden hover:shadow-xl transition bg-white dark:bg-gray-800/40"
          >
            {/* Featured image link */}
            <a href={`/${collection}/${slug}`} className="block overflow-hidden rounded-t-lg">
              <img
                src={featuredImage}
                alt={title}
                loading="lazy"
                className="w-full h-48 md:h-56 lg:h-64 object-cover object-center transition-transform duration-300 hover:scale-105"
              />
            </a>

            <div className="p-4 space-y-2">
              {/* Title */}
              <a href={`/${collection}/${slug}`} className="block w-full">
                <h3 className="text-lg font-semibold bg-accent-500 text-white w-full px-3 py-2 rounded-md">
                  {title}
                </h3>
              </a>

              {/* Date */}
              {date && <p className="text-sm text-white">{new Date(date).toLocaleDateString()}</p>}

              {/* Excerpt */}
              {excerpt && <p className="text-gray-700 dark:text-gray-300 text-sm">{excerpt}</p>}

              {/* Authors */}
              {authorsArray.length > 0 && (
                <p className="text-sm text-accent-500 mt-2">
                  By {authorsArray.map((a) => a.name ?? a).join(", ")}
                </p>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => {
                    const tagSlug = tag.toLowerCase().replace(/\s+/g, "-");
                    return (
                      <a
                        key={tag}
                        href={`/tags/${tagSlug}`}
                        className="inline-block bg-accent-500 text-white text-xs px-2 py-1 rounded hover:bg-primary-500"
                      >
                        #{tag}
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Organisations */}
              {orgBadges.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{orgBadges}</div>}

              {/* Category link */}
              {contentType && (
                <div className="mt-2">
                  <a
                    href={`/${collection}`}
                    className="inline-block bg-secondary-500 text-white text-xs px-2 py-1 rounded uppercase hover:bg-primary-500"
                  >
                    {contentType}
                  </a>
                </div>
              )}

              {/* SDG icons */}
              {sdgIcons.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{sdgIcons}</div>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}