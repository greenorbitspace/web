import React from "react";
import { SDGs } from "../data/sdgs";
import organisationsData from "../data/organisations.json";
import slugify from "slugify";

const fallbackIcon = "/sdgs/default.svg";

// Map SDGs for quick lookup
const sdgMap = SDGs.reduce<Record<string, typeof SDGs[0]>>((acc, sdg) => {
  const code = `SDG ${String(sdg.id).padStart(2, "0")}`;
  acc[code.toUpperCase()] = sdg;
  return acc;
}, {});

// Map organisations for quick lookup
const orgMap = organisationsData.reduce<Record<string, typeof organisationsData[0]>>(
  (acc, org) => {
    acc[org.slug] = org;
    return acc;
  },
  {}
);

type SpaceApp = {
  slug?: string;
  title?: string;
  Name?: string;
  featuredImage?: string;
  SDGs?: number[];
  organisations?: string[];
};

type Props = {
  app: SpaceApp;
};

export default function SpaceAppCard({ app }: Props) {
  const {
    slug,
    title,
    Name,
    featuredImage,
    SDGs: appSDGs = [],
    organisations = [],
  } = app;

  const appSlug = slug || (title || Name ? slugify(title || Name, { lower: true, strict: true }) : undefined);
  const displayTitle = title || Name || "Untitled Space Application";

  if (!appSlug) return null;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg group hover:shadow-2xl transition">
      {/* Featured Image */}
      <img
        src={featuredImage || "/images/default-featured.jpg"}
        alt={displayTitle}
        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 flex flex-col justify-between p-4">
        {/* Title */}
        <h2 className="text-lg md:text-xl font-bold text-white">{displayTitle}</h2>

        {/* Bottom content */}
        <div className="flex flex-col items-center gap-2">
          {/* SDG Icons */}
          {appSDGs.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {appSDGs.map((id) => {
                const code = `SDG ${String(id).padStart(2, "0")}`;
                const sdg = sdgMap[code.toUpperCase()] || {};
                const sdgGoal = sdg.name
                  ? encodeURIComponent(sdg.name.toLowerCase().replace(/\s+/g, "-"))
                  : code.toLowerCase();
                return (
                  <a
                    key={code}
                    href={`https://sdgs.greenorbit.space/${sdgGoal}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={sdg.name || code}
                  >
                    <img
                      src={sdg.icon || fallbackIcon}
                      alt={sdg.name || code}
                      className="w-10 h-10 rounded-sm border border-gray-300/40 hover:brightness-110 transition"
                    />
                  </a>
                );
              })}
            </div>
          )}

          {/* Organisation Badges */}
          {organisations.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {organisations.map((orgSlug) => {
                const org = orgMap[orgSlug] || { name: orgSlug, slug: "#" };
                return (
                  <a
                    key={orgSlug}
                    href={`/${org.slug}`}
                    title={org.name}
                    className="px-2 py-1 bg-secondary-500 text-white rounded-md text-sm hover:bg-secondary-600 transition"
                  >
                    {org.name}
                  </a>
                );
              })}
            </div>
          )}

          {/* Learn More */}
          <a
            href={`/space-applications/${appSlug}`}
            className="mt-2 px-4 py-2 bg-accent-500 text-white font-semibold rounded-lg text-sm hover:brightness-110 transition"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
}