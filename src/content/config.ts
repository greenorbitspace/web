import { z, defineCollection } from 'astro:content';

/**
 * Shared schema for all content collections.
 * Enforces consistent frontmatter and metadata validation.
 */
const baseSchema = z.object({
  title: z.string().min(5, 'Title should be at least 5 characters'),
  description: z.string().max(160, 'Meta description must be 160 characters or fewer').optional(),
  pubdate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'pubdate must be a valid ISO 8601 date string',
    }),
  slug: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  url: z.string().url().optional(),
  featured: z.boolean().optional(),
  notion_page_id: z.string().optional(),
  exported_at: z.string().optional(),
  name: z.string().optional(),

  // SEO-specific fields
  featuredImage: z.string().url().optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),

  // Custom sustainability tags for content classification
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
 * Content collections definitions.
 * Add new collections here as needed.
 */
export const collections = {
  blog: defineCollection({ schema: baseSchema }),
  news: defineCollection({ schema: baseSchema }),
  resources: defineCollection({ schema: baseSchema }),
  'press-releases': defineCollection({ schema: baseSchema }),
  tools: defineCollection({ schema: baseSchema }), 
};