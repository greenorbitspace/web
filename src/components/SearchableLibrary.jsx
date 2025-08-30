import React, { useState, useMemo } from "react";
import PaperCard from "./PaperCard.jsx";
import { SDGs } from "../data/sdgs";
import papersJson from "../data/papers.json";

const fallbackIcon = "/sdgs/default.svg";

// Map SDG code to SDG metadata
const sdgMap = SDGs.reduce((acc, sdg) => {
  const code = `SDG ${String(sdg.id).padStart(2, "0")}`;
  acc[code.toUpperCase()] = sdg;
  return acc;
}, {});

const SORT_OPTIONS = ["Year", "Author", "Title"];

export default function Library() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [selectedJournal, setSelectedJournal] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [activeSDG, setActiveSDG] = useState("All SDGs");
  const [sortBy, setSortBy] = useState("Year");
  const [sortAsc, setSortAsc] = useState(false);

  // Generate SDG filter options
  const sdgCategories = useMemo(() => {
    const set = new Set();
    papersJson.forEach(p =>
      (p.sdgs ?? []).forEach(id => set.add(`SDG ${String(id).padStart(2, "0")}`))
    );
    return ["All SDGs", ...Array.from(set).sort()];
  }, []);

  // Filter papers
  const filteredPapers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return papersJson.filter(p => {
      const title = (p.title ?? "").toLowerCase();
      const authors = (p.author ?? "").toLowerCase();
      const keywords = (p.keywords ?? []).map(k => k.toLowerCase());
      const publisher = (p.publisher ?? "").toLowerCase();
      const journal = (p.journal ?? "").toLowerCase();
      const booktitle = (p.booktitle ?? "").toLowerCase();
      const year = (p.year ?? "").toLowerCase();
      const sdgCodes = (p.sdgs ?? []).map(id => `SDG ${String(id).padStart(2, "0")}`);

      const venue = journal || booktitle; // Use journal first, then booktitle

      const matchSearch =
        title.includes(term) || authors.includes(term) || keywords.some(k => k.includes(term));
      const matchKeyword = !selectedKeyword || keywords.includes(selectedKeyword.toLowerCase());
      const matchPublisher = !selectedPublisher || publisher.includes(selectedPublisher.toLowerCase());
      const matchJournal = !selectedJournal || venue.includes(selectedJournal.toLowerCase());
      const matchYear = !selectedYear || year === selectedYear.toLowerCase();
      const matchSDG = activeSDG === "All SDGs" || sdgCodes.includes(activeSDG);

      return matchSearch && matchKeyword && matchPublisher && matchJournal && matchYear && matchSDG;
    });
  }, [searchTerm, selectedKeyword, selectedPublisher, selectedJournal, selectedYear, activeSDG]);

  // Sort papers
  const sortedPapers = useMemo(() => {
    const papers = [...filteredPapers];
    papers.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "Year":
          cmp = (parseInt(a.year) || 0) - (parseInt(b.year) || 0);
          break;
        case "Author":
          cmp = (a.author ?? "").localeCompare(b.author ?? "");
          break;
        case "Title":
          cmp = (a.title ?? "").localeCompare(b.title ?? "");
          break;
        default:
          cmp = 0;
      }
      return sortAsc ? cmp : -cmp;
    });
    return papers;
  }, [filteredPapers, sortBy, sortAsc]);

  // Generate filter dropdown options
  const keywordOptions = Array.from(new Set(papersJson.flatMap(p => p.keywords ?? [])));
  const publisherOptions = Array.from(new Set(papersJson.map(p => p.publisher).filter(Boolean)));
  const journalOptions = Array.from(
    new Set(papersJson.map(p => p.journal || p.booktitle).filter(Boolean))
  );
  const yearOptions = Array.from(new Set(papersJson.map(p => p.year).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* SDG Filter */}
      <nav className="flex flex-wrap gap-2 border-b pb-3 border-gray-300">
        {sdgCategories.map(code => {
          const sdg = sdgMap[code.toUpperCase()];
          const isAll = code === "All SDGs";

          return (
            <button
              key={code}
              onClick={() => setActiveSDG(code)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded ${
                activeSDG === code
                  ? "bg-accent-500 text-white shadow"
                  : "text-gray-200 hover:bg-gray-600"
              }`}
            >
              {!isAll && sdg && (
                <img
                  src={sdg.icon || fallbackIcon}
                  alt={sdg.name || code}
                  className="w-6 h-6"
                />
              )}
              <span>{isAll ? "All SDGs" : <span className="sr-only">{sdg?.name}</span>}</span>
            </button>
          );
        })}
      </nav>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Keyword", value: selectedKeyword, setter: setSelectedKeyword, options: keywordOptions },
          { label: "Publisher", value: selectedPublisher, setter: setSelectedPublisher, options: publisherOptions },
          { label: "Journal / Booktitle", value: selectedJournal, setter: setSelectedJournal, options: journalOptions },
          { label: "Year", value: selectedYear, setter: setSelectedYear, options: yearOptions },
          { label: "Sort By", value: sortBy, setter: setSortBy, options: SORT_OPTIONS },
        ].map(f => (
          <div key={f.label}>
            <label className="text-white block mb-1">{f.label}</label>
            {f.label === "Sort By" ? (
              <div className="flex gap-2">
                <select
                  value={f.value}
                  onChange={e => f.setter(e.target.value)}
                  className="w-full border rounded p-2 bg-gray-800 text-white"
                >
                  {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <button
                  onClick={() => setSortAsc(!sortAsc)}
                  className="px-2 py-2 bg-gray-700 text-white rounded"
                >
                  {sortAsc ? "↑" : "↓"}
                </button>
              </div>
            ) : (
              <select
                value={f.value}
                onChange={e => f.setter(e.target.value)}
                className="w-full border rounded p-2 bg-gray-800 text-white"
              >
                <option value="">All</option>
                {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            )}
          </div>
        ))}
      </div>

      {/* Papers Grid */}
      <ul className="grid gap-6 md:grid-cols-2" role="list">
        {sortedPapers.length === 0 ? (
          <li className="text-accent-500 italic">No papers found.</li>
        ) : (
          sortedPapers.map(p => {
            const sdgIcons = (p.sdgs ?? []).map(id => {
              const code = `SDG ${String(id).padStart(2, "0")}`;
              const sdg = sdgMap[code.toUpperCase()];
              return (
                <button
                  key={code}
                  onClick={() => setActiveSDG(code)}
                  className={`inline-flex items-center p-1 rounded hover:bg-accent-600 transition ${
                    activeSDG === code ? "bg-accent-700" : ""
                  }`}
                  title={sdg?.name}
                >
                  <img src={sdg?.icon || fallbackIcon} alt={sdg?.name || code} className="w-6 h-6"/>
                </button>
              );
            });

            return (
              <PaperCard
                key={p.id || p.title}
                {...p}
                sdgIcons={sdgIcons}
                onKeywordClick={setSelectedKeyword}
                onPublisherClick={setSelectedPublisher}
                onJournalClick={setSelectedJournal}
                activeKeywords={[selectedKeyword.toLowerCase()]}
                activePublisher={selectedPublisher}
                activeJournal={selectedJournal}
                cardBg="bg-white"
                titleClass="text-primary-500"
              />
            );
          })
        )}
      </ul>
    </div>
  );
}