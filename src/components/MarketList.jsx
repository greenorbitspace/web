import React, { useMemo } from 'react';
import slugify from '../utils/slugify.js';
import { SDGs } from '../data/sdgs';

const fallbackIcon = '/sdgs/default.svg';

// Build a lookup map for SDGs
const sdgMap = SDGs.reduce((acc, sdg) => {
  acc[sdg.id] = sdg;
  return acc;
}, {});

export default function MarketList({ markets = [] }) {
  const marketCards = useMemo(() => {
    return (markets || []).map((market) => {
      // Generate consistent kebab-case slug without & symbols
      const slug = slugify(market.name.replace(/&/g, 'and'), { lower: true, strict: true });

      // Collect unique SDGs from services
      const sdgs = Array.from(
        new Set(
          (market.services || [])
            .flatMap((service) => {
              if (!service.SDGs) return [];
              return Array.isArray(service.SDGs) ? service.SDGs : [service.SDGs];
            })
            .filter(Boolean)
        )
      ).sort((a, b) => a - b);

      return {
        name: market.name,
        slug,
        description: market.description || '',
        sdgs,
      };
    });
  }, [markets]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {marketCards.map((market) => (
        <a
          key={market.slug}
          href={`/markets/${market.slug}`}
          className="border rounded-lg p-4 shadow-sm flex flex-col h-full bg-white hover:shadow-md transition group"
        >
          <h3 className="text-lg font-semibold mb-2 group-hover:underline text-primary-500">
            {market.name}
          </h3>
          <p className="text-gray-700 text-sm flex-grow">{market.description}</p>

          {market.sdgs.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {market.sdgs.map((id) => {
                const sdg = sdgMap[id];
                return sdg ? (
                  <img
                    key={id}
                    src={sdg.icon || fallbackIcon}
                    alt={sdg.name}
                    aria-label={sdg.name}
                    className="w-6 h-6 rounded-sm border border-gray-200"
                  />
                ) : null;
              })}
            </div>
          )}
        </a>
      ))}
    </div>
  );
}