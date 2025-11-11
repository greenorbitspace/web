import { z, defineCollection } from 'astro:content';

/** 
 * Base schema for general content types
 */
const baseSchema = z.object({
  title: z.string().min(5),
  description: z.string().max(160).optional(),
  summary: z.string().max(300).optional(),
  pubdate: z.string().optional().refine(
    val => !val || !isNaN(Date.parse(val)),
    { message: 'pubdate must be a valid ISO 8601 date string' }
  ),
  slug: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.enum(['for space', 'from space', 'in space']).optional(),
  url: z.string().url().optional().nullable(),
  notion_page_id: z.string().optional(),
  exported_at: z.string().optional(),
  featuredImage: z.string().url().optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  featured: z.boolean().optional(),
  sustainableFocus: z.enum([
    'energy',
    'emissions',
    'materials',
    'space-debris',
    'education',
    'policy',
  ]).optional(),
  pledges: z.array(z.string()).optional(),
  organisations: z.array(z.string()).optional(),
  SDGs: z.array(z.number()).optional(),
});

/** 
 * Campaign schema
 */
const campaignSchema = baseSchema.extend({
  name: z.string().optional(),
  month: z.string().optional().nullable(),
  un_resolution: z.string().optional().nullable(),
  'un-resolution': z.string().optional().nullable(), // allow dash-key
});

/** 
 * Organisation-specific schema (updated to match JSON keys)
 */
const organisationSchema = z.object({
  organisation: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  url: z.string().url().optional().nullable(),
  'hubspot-id': z.string().optional(),
  industry: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(['partner', 'client', 'member', 'supplier']).optional(),
  logo: z.string().optional(),
});

/** 
 * Pledge schema
 */
const pledgeSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  description: z.string().optional(),
  organisations: z.array(z.string()).optional(),
  values: z.array(z.string()).optional(),
  how: z.string().optional(),
  why: z.string().optional(),
  SDGs: z.array(z.number()).optional(),
  commitments: z.array(z.string()).optional(),
  CSR: z.string().optional(),
  logo: z.string()
    .regex(/^(https?:\/\/|\/)/, { message: 'Logo must be a full URL or start with / for public assets' })
    .optional(),
  url: z.string().url().optional().nullable(),
});

/** 
 * Career schema
 */
const careerSchema = z.object({
  title: z.string().min(5),
  slug: z.string().optional(),
  pubdate: z.string().optional().refine(
    val => !val || !isNaN(Date.parse(val)),
    { message: 'pubdate must be a valid ISO 8601 date string' }
  ),
  location: z.string().optional(),
  employment_type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary']).optional(),
  department: z.string().optional(),
  seniority_level: z.enum(['Junior', 'Mid', 'Senior', 'Lead', 'Director', 'Executive']).optional(),
  description: z.string().min(20),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  apply_url: z.string().url().optional().nullable(),
  contact_email: z.string().email().optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  featuredImage: z.string().url().optional(),
});

/** 
 * Define all content collections
 */
export const collections = {
  blog: defineCollection({ schema: baseSchema }),
  news: defineCollection({ schema: baseSchema }),
  resources: defineCollection({ schema: baseSchema }),
  'press-releases': defineCollection({ schema: baseSchema }),
  tools: defineCollection({ schema: baseSchema }),
  insights: defineCollection({ schema: baseSchema }),
  'space-sustainability': defineCollection({ schema: baseSchema }),
  organisations: defineCollection({ schema: organisationSchema }),
  pledges: defineCollection({ schema: pledgeSchema }),
  careers: defineCollection({ schema: careerSchema }),
  campaigns: defineCollection({ schema: campaignSchema }),
};