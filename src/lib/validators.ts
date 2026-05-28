import { z } from 'zod';

// Accept absolute URLs (e.g. https://placedog.net/...) or app-relative paths
// served by our /api/uploads/[file] route (e.g. /api/uploads/abc.jpg).
const photoUrl = z.string().refine(
  (v) => /^https?:\/\//.test(v) || v.startsWith('/'),
  'Invalid photo URL'
);

export const phoneSchema = z
  .string()
  .trim()
  .min(8, 'Phone too short')
  .max(20, 'Phone too long')
  .regex(/^[+0-9\s\-()]+$/, 'Invalid characters');

export const otpSchema = z.string().regex(/^\d{4}$/, 'OTP must be 4 digits');

export const CITIES = ['Bangalore', 'Mumbai', 'Delhi'] as const;
export const citySchema = z.enum(CITIES);

export const userProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  bio: z.string().trim().max(280).optional().nullable(),
  city: citySchema,
  photoUrl: photoUrl.optional().nullable(),
});

export const TEMPERAMENTS = [
  'friendly', 'playful', 'gentle', 'energetic', 'shy',
  'chill', 'social', 'loyal', 'curious', 'cuddly',
] as const;

export const ACTIVITIES = [
  'walks', 'fetch', 'swim', 'park visits', 'training', 'cuddles',
] as const;

export const petSchema = z.object({
  name: z.string().trim().min(1).max(40),
  species: z.enum(['DOG', 'CAT', 'RABBIT', 'BIRD', 'OTHER']).default('DOG'),
  breed: z.string().trim().min(1).max(60),
  age: z.coerce.number().int().min(0).max(30),
  gender: z.enum(['MALE', 'FEMALE']),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
  temperament: z.array(z.string()).min(1, 'Pick at least one trait').max(5),
  activities: z.array(z.string()).max(6).default([]),
  bio: z.string().trim().max(280).optional().nullable(),
  vaccinated: z.boolean().default(false),
  photoUrls: z.array(photoUrl).min(1, 'At least one photo').max(6),
});

export const messageSchema = z.object({
  matchId: z.string().min(1),
  text: z.string().trim().max(1000).optional().nullable(),
  imageUrl: photoUrl.optional().nullable(),
}).refine((d) => !!(d.text || d.imageUrl), { message: 'Message empty' });

export const meetupSchema = z.object({
  matchId: z.string().min(1),
  venueId: z.string().min(1).optional().nullable(),
  note: z.string().trim().max(200).optional().nullable(),
});
