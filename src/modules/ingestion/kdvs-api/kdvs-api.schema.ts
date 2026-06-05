import { z } from 'zod';

const linkSchema = z.object({ href: z.string().url() });

const personaLinksSchema = z.preprocess((value) => {
  if (value == null) return undefined;
  return Array.isArray(value) ? value : [value];
}, z.array(linkSchema).optional());

export const scheduleItemSchema = z.object({
  id: z.number(),
  show_id: z.number().nullable().optional(),
  start: z.string(),
  end: z.string(),
  duration: z.number(),
  timezone: z.string(),
  one_off: z.boolean().nullable().optional(),
  category: z.string(),
  title: z.string(),
  image: z.string().nullable(),
  _links: z.object({
    self: z.object({ href: z.string().url() }),
    personas: z.array(linkSchema).optional(),
    persona: personaLinksSchema,
  }),
});

export const scheduleResponseSchema = z.object({
  future: z.array(scheduleItemSchema).optional(),
  past: z.array(scheduleItemSchema).optional(),
});

export type zScheduleItem = z.infer<typeof scheduleItemSchema>;
export type zScheduleResponse = z.infer<typeof scheduleResponseSchema>;