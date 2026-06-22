import { z } from 'zod';

export const createPlayerSchema = z.object({
  name: z.string().min(1, 'Player name is required'),
  team: z.string().optional(),
  role: z.string().optional(),
  Campus: z.string().optional(),
  imageUrl: z.string().optional(),
  battingStyle: z.string().optional(),
  bowlingStyle: z.string().optional(),
  playingRole: z.string().optional(),
  birthInfo: z.object({
    date: z.string().optional(),
    place: z.string().optional()
  }).optional(),
  age: z.number().optional(),
  relations: z.array(z.object({
    player: z.string().optional(),
    relationType: z.string().optional()
  })).optional(),
  teamHistory: z.array(z.object({
    team: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    isCurrent: z.boolean().optional()
  })).optional()
});