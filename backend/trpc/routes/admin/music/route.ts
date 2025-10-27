import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

let mockMusic = [
  {
    id: '1',
    title: 'Amazing Grace',
    artist: 'Worship Team',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    duration: '3:45',
    category: 'worship',
    createdAt: new Date().toISOString(),
    createdBy: 'admin',
  },
];

export const listMusicProcedure = publicProcedure
  .input(z.object({
    category: z.enum(['all', 'worship', 'sermon', 'background']).optional(),
  }).optional())
  .query(({ input }) => {
    let music = mockMusic;
    
    if (input?.category && input.category !== 'all') {
      music = music.filter(m => m.category === input.category);
    }
    
    return music.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

export const getMusicProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }) => {
    const music = mockMusic.find(m => m.id === input.id);
    if (!music) throw new Error('Music not found');
    return music;
  });

export const createMusicProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    artist: z.string(),
    audioUrl: z.string().url(),
    imageUrl: z.string().url().optional(),
    duration: z.string().optional(),
    category: z.enum(['worship', 'sermon', 'background']),
    createdBy: z.string(),
  }))
  .mutation(({ input }) => {
    const newMusic = {
      id: Date.now().toString(),
      ...input,
      imageUrl: input.imageUrl || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
      duration: input.duration || '0:00',
      createdAt: new Date().toISOString(),
    };
    
    mockMusic.push(newMusic);
    return newMusic;
  });

export const updateMusicProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    artist: z.string().optional(),
    audioUrl: z.string().url().optional(),
    imageUrl: z.string().url().optional(),
    duration: z.string().optional(),
    category: z.enum(['worship', 'sermon', 'background']).optional(),
  }))
  .mutation(({ input }) => {
    const musicIndex = mockMusic.findIndex(m => m.id === input.id);
    if (musicIndex === -1) throw new Error('Music not found');
    
    mockMusic[musicIndex] = { ...mockMusic[musicIndex], ...input };
    return mockMusic[musicIndex];
  });

export const deleteMusicProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    mockMusic = mockMusic.filter(m => m.id !== input.id);
    return { success: true, message: 'Music deleted successfully' };
  });
