import React, { useState, useMemo } from 'react';
import faqs from '../data/schema/FAQs.json';

const groupedFaqs = faqs.reduce((acc, faq) => {
  acc[faq.category] = acc[faq.category] || [];
  acc[faq.category].push(faq);
  return acc;
}, {});

const sortedCategories = Object.keys(groupedFaqs).sort();

function renderAnswer(answer, links) {
  if (!links || links.length === 0) {
    return answer;
  }

  // We'll split the answer by the link texts, inserting anchors in between.
  // Sort links by their first occurrence index in answer, ascending
  const sortedLinks = [...links].sort((a, b) => {
    return answer.indexOf(a.text) - answer.indexOf(b.text);
  });

  let lastIndex = 0;
  const elements = [];

  sortedLinks.forEach(({ text, url }, idx) => {
    const start = answer.indexOf(text, lastIndex);
    if (start === -1) {
      // If link text not found, ignore this link
      return;
    }

    // Add text before link
    if (start > lastIndex) {
      elements.push(answer.slice(lastIndex, start));
    }

    // Add link
    elements.push(
      <a
        key={`link-${idx}`}
        href={url}
        target={url.startsWith('http') ? '_blank' : undefined}
        rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="underline hover:text-blue-300"
      >
        {text}
      </a>
    );

    lastIndex = start + text.length;
  });

  // Add remaining text after last link
  if (lastIndex < answer.length) {
    elements.push(answer.slice(lastIndex));
  }

  return elements;
}

export default function FAQSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState(() =>
    sortedCategories.reduce((acc, cat) => {
      acc[cat] = false;
      return acc;
    }, {})
  );

  const filteredGroupedFaqs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return groupedFaqs;
    }

    const filtered = {};

    for (const category of sortedCategories) {
      const filteredFaqs = groupedFaqs[category].filter(({ question, answer }) =>
        question.toLowerCase().includes(term) || answer.toLowerCase().includes(term)
      );
      if (filteredFaqs.length > 0) {
        filtered[category] = filteredFaqs;
      }
    }

    return filtered;
  }, [searchTerm]);

  function toggleCategory(cat) {
    setOpenCategories(prev => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  }

  return (
    <div className="max-w-3xl mx-auto p-8 md:p-12 dark:bg-secondary-500 rounded-md text-white">

      <div className="mb-8">
        <input
          type="search"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          aria-label="Search FAQs"
          className="w-full p-3 rounded-md bg-gray-100 dark:bg-white text-gray-900 dark:text-primary-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {Object.keys(filteredGroupedFaqs).length === 0 ? (
        <p className="text-gray-300">No FAQs match your search.</p>
      ) : (
        Object.entries(filteredGroupedFaqs).map(([category, faqs]) => (
          <div key={category} className="mb-8 rounded-md overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              aria-expanded={openCategories[category]}
              aria-controls={`faq-section-${category}`}
              className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-accent-500 text-gray-900 dark:text-white font-semibold text-lg hover:bg-gray-200 dark:hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
              <span className="text-2xl select-none">{openCategories[category] ? '−' : '+'}</span>
            </button>

            {openCategories[category] && (
              <dl
                id={`faq-section-${category}`}
                className="px-6 py-4 bg-secondary-500 text-white"
              >
                {faqs.map(({ question, answer, links }, i) => (
                  <div key={i} className="mb-6 last:mb-0">
                    <dt className="font-bold text-lg mb-2">{question}</dt>
                    <dd className="ml-4 leading-relaxed text-gray-200">
                      {renderAnswer(answer, links)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        ))
      )}
    </div>
  );
}