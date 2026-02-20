import { z } from 'zod';

export const createPlayerSchema = z.object({
  name: z.string().min(1, 'Player name is required'),
  team: z.string().optional(),
  role: z.string().optional(),
  Campus: z.string().optional(),
  imageUrl: z.string().optional(),
  battingStyle: z.string().optional(),
  bowlingStyle: z.string().optional()
});