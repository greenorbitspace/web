import { z, defineCollection } from 'astro:content';

const baseSchema = z.object({
  title: z.string().min(5),
  description: z.string().max(160).optional(),
  pubdate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'pubdate must be a valid ISO 8601 date string',
  }),
  slug: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  url: z.string().url().optional(),
  notion_page_id: z.string().optional(),
  exported_at: z.string().optional(),
  name: z.string().optional(),
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

  // Linked metadata
  pledges: z.array(z.string()).optional(),
  organisations: z.array(z.string()).optional(),
  SDGs: z.array(z.number()).optional(),
});

const organisationSchema = baseSchema.extend({
  Organisation: z.string().min(2),
  Description: z.string().optional(),
  URL: z.string().url().optional(),
  'HubSpot Company ID': z.string().optional(),
  Industry: z.string().optional(),
  Category: z.string().optional(),
  Type: z.enum(['client', 'partner', 'member', 'supplier']).optional(),
  listing: z.boolean().optional(),
  entry: z.boolean().optional(),
});

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

  // Allow either remote URLs or /public paths for logos
  logo: z.string()
    .regex(/^(https?:\/\/|\/)/, { message: 'Logo must be a full URL or start with / for public assets' })
    .optional(),

  URL: z.string().url().optional(),
});

// New career/job posting schema
const careerSchema = z.object({
  title: z.string().min(5),
  slug: z.string().optional(),
  pubdate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'pubdate must be a valid ISO 8601 date string',
  }),
  location: z.string().optional(),
  employment_type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary']).optional(),
  department: z.string().optional(),
  seniority_level: z.enum(['Junior', 'Mid', 'Senior', 'Lead', 'Director', 'Executive']).optional(),
  description: z.string().min(20),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  apply_url: z.string().url().optional(),
  contact_email: z.string().email().optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  featuredImage: z.string().url().optional(),
});

export const collections = {
  blog: defineCollection({ schema: baseSchema }),
  news: defineCollection({ schema: baseSchema }),
  resources: defineCollection({ schema: baseSchema }),
  'press-releases': defineCollection({ schema: baseSchema }),
  tools: defineCollection({ schema: baseSchema }),
  insights: defineCollection({ schema: baseSchema }),
  organisations: defineCollection({ schema: organisationSchema }),
  pledges: defineCollection({ schema: pledgeSchema }),
  careers: defineCollection({ schema: careerSchema }),  // <-- added careers collection
};