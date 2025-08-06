import { z, defineCollection } from 'astro:content';

/**
 * Base schema applied across all collections
 */
const baseSchema = z.object({
  // Core metadata
  title: z.string().min(5, 'Title should be at least 5 characters'),
  description: z.string().max(160).optional(),
  pubdate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'pubdate must be a valid ISO 8601 date string',
  }),
  slug: z.string().optional(),
  author: z.string().optional(),

  // Tagging and classification
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),

  // Linking and identity
  url: z.string().url().optional(),
  notion_page_id: z.string().optional(),
  exported_at: z.string().optional(),
  name: z.string().optional(),

  // SEO
  featuredImage: z.string().url().optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  featured: z.boolean().optional(),

  // Sustainability classification
  sustainableFocus: z.enum([
    'energy',
    'emissions',
    'materials',
    'space-debris',
    'education',
    'policy',
  ]).optional(),
});

/**
 * Organisation-specific schema, aligned with your JSON data keys
 */
const organisationSchema = baseSchema.extend({
  Organisation: z.string().min(2, 'Organisation name is required'),
  Description: z.string().optional(),
  URL: z.string().url().optional(),
  'HubSpot Company ID': z.string().optional(),
  Industry: z.string().optional(),
  Category: z.string().optional(),
  Type: z.enum(['client', 'partner', 'member', 'supplier']).optional(),
  listing: z.boolean().optional(),
  entry: z.boolean().optional(),
});

/**
 * All content collections for the site
 */
export const collections = {
  blog: defineCollection({ schema: baseSchema }),
  news: defineCollection({ schema: baseSchema }),
  resources: defineCollection({ schema: baseSchema }),
  'press-releases': defineCollection({ schema: baseSchema }),
  tools: defineCollection({ schema: baseSchema }),
  organisations: defineCollection({ schema: organisationSchema }),
};