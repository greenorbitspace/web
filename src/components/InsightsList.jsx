import React, { useState, useMemo } from "react";
import slugify from "slugify";
import { SDGs } from "../data/sdgs";
import organisationsData from "../data/organisations.json";
import InsightsGrid from "./InsightsGrid";

const fallbackIcon = "/sdgs/default.svg";

// Map SDGs
const sdgMap = SDGs.reduce((acc, sdg) => {
  const code = `SDG ${String(sdg.id).padStart(2, "0")}`;
  acc[code.toUpperCase()] = sdg;
  return acc;
}, {});

// Map organisations
const orgMap = organisationsData.reduce((acc, org) => {
  acc[org.slug] = org;
  return acc;
}, {});

const CATEGORIES = ["All", "Blog", "News", "Resource"];

export default function InsightsList({ posts = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSDG, setActiveSDG] = useState("All");

  // Build SDG filter options dynamically
  const sdgCategories = useMemo(() => {
    const set = new Set();
    posts.forEach((post) => {
      const sdgs = post.data?.SDGs;
      if (Array.isArray(sdgs)) sdgs.forEach((id) => set.add(`SDG ${String(id).padStart(2, "0")}`));
      else if (typeof sdgs === "number") set.add(`SDG ${String(sdgs).padStart(2, "0")}`);
    });
    return ["All", ...Array.from(set).sort()];
  }, [posts]);

  // Filtering logic
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
      <div className="flex flex-wrap gap-3 mb-4">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded font-semibold transition ${
              activeCategory === category
                ? "bg-accent-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-accent-400"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Search Bar */}
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

      {/* Render Insights Grid */}
      <InsightsGrid entries={filteredPosts} sdgMap={sdgMap} orgMap={orgMap} />
    </div>
  );
}