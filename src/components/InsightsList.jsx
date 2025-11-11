import React, { useState, useMemo } from "react";
import { SDGs } from "../data/sdgs";

const fallbackIcon = "/sdgs/default.svg";
const fallbackImage = "/images/placeholder.jpg";

const sdgMap = SDGs.reduce((acc, sdg) => {
  const code = `SDG ${String(sdg.id).padStart(2, "0")}`;
  acc[code.toUpperCase()] = sdg;
  return acc;
}, {});

const CATEGORIES = ["All", "Blog", "News", "Resource"];

export default function InsightsList({ posts = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSDG, setActiveSDG] = useState("All");

  const sdgCategories = useMemo(() => {
    const set = new Set();
    posts.forEach((post) => {
      const sdgs = post.data?.SDGs;
      if (Array.isArray(sdgs)) sdgs.forEach((id) => set.add(`SDG ${String(id).padStart(2, "0")}`));
      else if (typeof sdgs === "number") set.add(`SDG ${String(sdgs).padStart(2, "0")}`);
    });
    return ["All", ...Array.from(set).sort()];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const cat = activeCategory.toLowerCase();
    const today = new Date();

    return posts.filter((post) => {
      const fm = post.data ?? {};
      const title = (fm.title ?? "").toLowerCase();
      const excerpt = (fm.excerpt ?? "").toLowerCase();
      const tags = fm.tags ?? [];
      const contentType = (fm.contentType ?? "").toLowerCase();

      const sdgCodes = Array.isArray(fm.SDGs)
        ? fm.SDGs.map((id) => `SDG ${String(id).padStart(2, "0")}`)
        : typeof fm.SDGs === "number"
        ? [`SDG ${String(fm.SDGs).padStart(2, "0")}`]
        : [];

      const matchSDG = activeSDG === "All" || sdgCodes.includes(activeSDG);
      const matchCat = activeCategory === "All" || contentType === cat;
      const matchSearch =
        title.includes(term) ||
        excerpt.includes(term) ||
        tags.some((tag) => tag.toLowerCase().includes(term));

      // --- Only include posts with pubdate on or before today ---
      const pubdate = fm.pubdate ? new Date(fm.pubdate) : null;
      const validDate = pubdate ? pubdate <= today : false;

      return matchSDG && matchCat && matchSearch && validDate;
    });
  }, [searchTerm, activeCategory, activeSDG, posts]);

  return (
    <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8">
      {/* SDG Filter */}
      <nav className="flex flex-wrap gap-2 border-b pb-3 border-accent-500 dark:border-accent-500">
        <button
          onClick={() => setActiveSDG("All")}
          className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
            activeSDG === "All"
              ? "bg-accent-600 text-white shadow"
              : "text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700"
          }`}
        >
          All SDGs
        </button>
        {sdgCategories
          .filter((code) => code !== "All")
          .map((code) => {
            const sdg = sdgMap[code.toUpperCase()];
            return (
              <button
                key={code}
                onClick={() => setActiveSDG(code)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md transition ${
                  activeSDG === code
                    ? "bg-accent-600 text-white shadow"
                    : "text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700"
                }`}
              >
                <img
                  src={sdg?.icon || fallbackIcon}
                  alt={sdg?.name || code}
                  className="w-10 h-10 rounded-sm border border-gray-300/40"
                />
                <span className="sr-only">{sdg?.name}</span>
              </button>
            );
          })}
      </nav>

      {/* Category Tabs */}
      <div className="flex space-x-4 mb-4">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded font-semibold ${
              activeCategory === category
                ? "bg-accent-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-accent-400"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 w-full gap-4">
        <h2 className="text-2xl font-bold">Insights</h2>
        <input
          type="text"
          placeholder="Search articles, resources, news..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-sm"
        />
      </div>

      {/* Insights Grid */}
      <ul className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
        {filteredPosts.length === 0 ? (
          <li className="text-accent-500 italic">No insights found.</li>
        ) : (
          filteredPosts.map((post) => {
            const {
              title,
              pubdate,
              excerpt,
              tags = [],
              contentType,
              organisations = [],
              SDGs = [],
              featuredImage,
            } = post.data;

            const date = pubdate
              ? new Date(pubdate).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "";

            const sdgIcons = Array.isArray(SDGs)
              ? SDGs.map((id) => {
                  const code = `SDG ${String(id).padStart(2, "0")}`;
                  const sdg = sdgMap[code.toUpperCase()];
                  return (
                    <a
                      key={code}
                      href={`https://sdgs.greenorbit.space/${id}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={sdg?.icon || fallbackIcon}
                        alt={sdg?.name || code}
                        className="w-8 h-8 rounded-sm border border-gray-300/40 transition-transform hover:scale-110"
                      />
                    </a>
                  );
                })
              : [];

            return (
              <li
                key={post.slug || post.id}
                className="border border-accent-500 rounded-lg overflow-hidden hover:shadow-xl transition bg-white dark:bg-gray-800/40"
              >
                {/* Featured Image */}
                <a
                  href={`/${post.collection}/${post.slug || post.id}`}
                  className="block overflow-hidden rounded-t-lg"
                >
                  <img
                    src={featuredImage || fallbackImage}
                    alt={title}
                    loading="lazy"
                    className="w-full h-64 md:h-72 lg:h-80 object-cover object-center transition-transform duration-300 hover:scale-105"
                  />
                </a>

                {/* Card Content */}
                <div className="p-4 space-y-3">
                  <a href={`/${post.collection}/${post.slug || post.id}`} className="block w-full">
                    <h3 className="text-lg font-semibold bg-accent-500 text-white w-full px-3 py-2 rounded-md transition-colors">
                      {title}
                    </h3>
                  </a>

                  {date && <p className="text-sm text-white">{date}</p>}
                  {excerpt && <p className="text-gray-700 dark:text-gray-300 text-sm">{excerpt}</p>}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-accent-500 text-white text-xs px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {organisations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {organisations.map((org) => (
                        <a
                          key={org.slug}
                          href={`/organisations/${org.slug}`}
                          className="bg-gray-300 dark:bg-accent-500 text-white rounded-full px-3 py-1 text-xs font-medium capitalize"
                        >
                          {org.name}
                        </a>
                      ))}
                    </div>
                  )}

                  {contentType && (
                    <div className="mt-2">
                      <a
                        href={`/${post.collection}/`}
                        className="inline-block bg-primary-600 text-white text-xs px-2 py-1 rounded uppercase hover:bg-primary-700"
                      >
                        {contentType}
                      </a>
                    </div>
                  )}

                  {sdgIcons.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{sdgIcons}</div>}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}