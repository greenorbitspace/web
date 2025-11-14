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
  category: z.enum(['for space', 'from space', 'in space']).optional(),
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

/** Team / Person schema */
const teamSchema = z
  .object({
    title: z.string().min(3),
    slug: z.string().optional(),
    author: z.string().optional().default(''),
    pubdate: z.string().optional(),
    featured: z.boolean().optional(),
    image: z.string().optional().default(DEFAULT_FEATURED_IMAGE),
    jobTitle: z.string().optional().default(''),
    worksFor: z
      .object({
        name: z.string(),
        url: z.string().url().optional().default(''),
      })
      .optional(),
    sameAs: z.array(z.string().url()).optional().default([]),
    description: z.string().optional().default(''),
    quote: z.string().optional().default(''),
    motivations: z.string().optional().default(''),
    funFact: z.string().optional().default(''),
    knowsAbout: z.array(z.string()).optional().default([]),
    skills: z.array(z.string()).optional().default([]),
    awards: z.array(z.string()).optional().default([]),
    hobbies: z.array(z.string()).optional().default([]),
    interests: z.array(z.string()).optional().default([]),
    location: z.string().optional().default(''),
    nationality: z.string().optional().default(''),
    socialLinks: z.record(z.string().url()).optional().default({}),
    contactEmail: z.string().email().optional().default(''),
    seoTitle: z.string().max(70).optional().default(''),
    seoDescription: z.string().max(160).optional().default(''),
  })
  .transform(data => ({
    ...data,
    slug: data.slug || slugify(data.title, { lower: true, strict: true }),
  }));

/** Organisation schema */
const organisationSchema = z.object({
  organisation: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional().default(''),
  url: z.string().url().optional().nullable(),
  'hubspot-id': z.string().optional().default(''),
  industry: z.string().optional().default(''),
  category: z.string().optional().default(''),
  type: z.enum(['partner', 'client', 'member', 'supplier']).optional(),
  logo: z.string().optional().default(DEFAULT_FEATURED_IMAGE),
});

/** Pledge schema */
const pledgeSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  description: z.string().optional().default(''),
  organisations: z.array(z.string()).optional().default([]),
  values: z.array(z.string()).optional().default([]),
  how: z.string().optional().default(''),
  why: z.string().optional().default(''),
  SDGs: z.array(z.number()).optional().default([]),
  commitments: z.array(z.string()).optional().default([]),
  CSR: z.string().optional().default(''),
  logo: z
    .string()
    .regex(/^(https?:\/\/|\/)/, { message: 'Logo must be a full URL or start with /' })
    .optional()
    .default(DEFAULT_FEATURED_IMAGE),
  url: z.string().url().optional().nullable(),
});

/** Career schema */
const careerSchema = z.object({
  title: z.string().min(5),
  slug: z.string().optional(),
  pubdate: z.string().optional(),
  location: z.string().optional().default(''),
  employment_type: z
    .enum(['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'])
    .optional(),
  department: z.string().optional().default(''),
  seniority_level: z
    .enum(['Junior', 'Mid', 'Senior', 'Lead', 'Director', 'Executive'])
    .optional(),
  description: z.string().min(20),
  responsibilities: z.array(z.string()).optional().default([]),
  requirements: z.array(z.string()).optional().default([]),
  benefits: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  apply_url: z.string().url().optional().nullable(),
  contact_email: z.string().email().optional().default(''),
  seoTitle: z.string().max(70).optional().default(''),
  seoDescription: z.string().max(160).optional().default(''),
  featuredImage: z
    .string()
    .regex(/^(https?:\/\/|\/)/, { message: 'featuredImage must be a full URL or start with /' })
    .optional()
    .default(DEFAULT_FEATURED_IMAGE),
});

/** Campaign schema */
const campaignSchema = baseSchema.extend({
  name: z.string().optional().default(''),
  month: z.string().optional().nullable(),
  un_resolution: z.string().optional().nullable(),
  'un-resolution': z.string().optional().nullable(),
  featuredImage: z
    .string()
    .regex(/^(https?:\/\/|\/)/, { message: 'featuredImage must be a full URL or start with /' })
    .optional()
    .default(DEFAULT_FEATURED_IMAGE),
});

/** Define all collections and make optional to suppress missing folder warnings */
export const collections = {
  blog: defineCollection({ schema: baseSchema, optional: true }),
  news: defineCollection({ schema: baseSchema, optional: true }),
  resources: defineCollection({ schema: baseSchema, optional: true }),
  'press-releases': defineCollection({ schema: baseSchema, optional: true }),
  tools: defineCollection({ schema: baseSchema, optional: true }),
  insights: defineCollection({ schema: baseSchema, optional: true }),
  'space-sustainability': defineCollection({ schema: baseSchema, optional: true }),
  organisations: defineCollection({ schema: organisationSchema, optional: true }),
  pledges: defineCollection({ schema: pledgeSchema, optional: true }),
  careers: defineCollection({ schema: careerSchema, optional: true }),
  campaigns: defineCollection({ schema: campaignSchema, optional: true }),
  team: defineCollection({ schema: teamSchema, optional: true }),
};

/** 
 * ⚠️ Important: Create the corresponding content folders even if empty:
 * mkdir -p src/content/{blog,news,resources,press-releases,tools,insights,space-sustainability,organisations,pledges,careers,campaigns,team}
 * Add _placeholder.md to each if needed to suppress glob-loader warnings.
 */