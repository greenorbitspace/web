import { z, defineCollection } from 'astro:content';
import slugify from 'slugify';

/** Default fallback image for content entries */
const DEFAULT_FEATURED_IMAGE = '/images/default-featured.jpg';

/** Base schema for general content types */
const baseSchema = z.object({
  title: z.string().min(5),
  description: z.string().max(160).optional().default(''),
  summary: z.string().max(300).optional().default(''),
  pubdate: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'pubdate must be a valid ISO 8601 date string',
    }),
  slug: z.string().optional(),
  author: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  category: z.enum(['for space', 'from space', 'in space', 'e-commerce', 'SaaS', 'Healthcare']).optional(),
  url: z.string().url().optional().nullable(),
  notion_page_id: z.string().optional().default(''),
  exported_at: z.string().optional().default(''),
  featuredImage: z
    .string()
    .regex(/^(https?:\/\/|\/)/, { message: 'featuredImage must be a full URL or start with /' })
    .optional()
    .default(DEFAULT_FEATURED_IMAGE),
  seoTitle: z.string().max(70).optional().default(''),
  seoDescription: z.string().max(160).optional().default(''),
  featured: z.boolean().optional(),
  sustainableFocus: z
    .enum(['energy', 'emissions', 'materials', 'space-debris', 'education', 'policy'])
    .optional(),
  pledges: z.array(z.string()).optional().default([]),
  organisations: z.array(z.string()).optional().default([]),
  SDGs: z.array(z.number()).optional().default([]),
});

/** Case Studies schema (extends baseSchema) */
const caseStudySchema = baseSchema.extend({
  metrics: z.array(z.string()).optional().default([]),
});

/** Sector schema */
const sectorSchema = z.object({
  name: z.string().min(3),
  slug: z.string().optional(),
  description: z.string().optional().default(''),
  featuredImage: z.string().optional().default(DEFAULT_FEATURED_IMAGE),
  relatedCaseStudies: z.array(z.string()).optional().default([]),
});

/** Global Challenge schema */
const globalChallengeSchema = z.object({
  title: z.string().min(5),
  slug: z.string().optional(),
  description: z.string().optional().default(''),
  featured: z.boolean().optional().default(false),
  featuredImage: z.string().optional().default(DEFAULT_FEATURED_IMAGE),
  SDGs: z.array(z.number()).optional().default([]),
  organisations: z.array(z.string()).optional().default([]),

  paris_agreement: z
    .object({
      article: z.string(),
      summary: z.string(),
      link: z.string().url(),
    })
    .optional(),

  sendai_framework: z
    .object({
      references: z.array(
        z.object({
          code: z.string(),
          summary: z.string(),
          link: z.string().url(),
        })
      ),
    })
    .optional(),

  space2030: z
    .object({
      section: z.string(),
      summary: z.string(),
      link: z.string().url(),
    })
    .optional(),

  seoTitle: z.string().max(70).optional().default(''),
  seoDescription: z.string().max(160).optional().default(''),
});

/** Space Apps schema */
const spaceAppSchema = z.object({
  title: z.string().min(5),
  markets: z.string().optional().default(''),
  description: z.string().optional().default(''),
  domains: z.string().optional().default(''),
  copernicus: z.enum(['Yes', 'No']).optional().default('No'),
  EGNSS: z.enum(['Yes', 'No']).optional().default('No'),
  SDGs: z.array(z.number()).optional().default([]),
  slug: z.string().optional(),
  featuredImage: z.string().optional().default(DEFAULT_FEATURED_IMAGE),
});

/** 🔥 Service Areas schema — for local SEO pages */
const serviceAreaSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  h1: z.string().min(5),
  metaDescription: z.string().max(160),
  keywords: z.array(z.string()).optional().default([]),
  description: z.string().optional().default(''),
  featuredImage: z.string().optional().default(DEFAULT_FEATURED_IMAGE),

  // Future-proof fields
  localChallenges: z.array(z.string()).optional().default([]),
  howWeHelp: z.array(z.string()).optional().default([]),
  SDGs: z.array(z.number()).optional().default([]),
  organisations: z.array(z.string()).optional().default([]),
});

/** Define all collections */
export const collections = {
  blog: defineCollection({ schema: baseSchema }),
  news: defineCollection({ schema: baseSchema }),
  resources: defineCollection({ schema: baseSchema }),
  'press-releases': defineCollection({ schema: baseSchema }),
  tools: defineCollection({ schema: baseSchema }),
  insights: defineCollection({ schema: baseSchema }),
  'space-sustainability': defineCollection({ schema: baseSchema }),
  caseStudies: defineCollection({ schema: caseStudySchema }),
  sectors: defineCollection({ schema: sectorSchema }),
  'global-challenges': defineCollection({ schema: globalChallengeSchema }),
  'space-apps': defineCollection({ schema: spaceAppSchema }),
  'service-areas': defineCollection({ schema: serviceAreaSchema }), // ✅ NEW
};

/**
 * mkdir -p src/content/{...,service-areas}
 * Add _placeholder.md if needed to silence warnings.
 */