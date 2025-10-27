import { z } from 'zod';
import { publicProcedure } from '../../create-context';

let donations: Array<{
  id: string;
  amount: number;
  type: 'one-time' | 'monthly';
  paymentMethod: 'card' | 'bank' | 'paypal';
  userId: string;
  userName: string;
  userEmail: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}> = [];

export const createDonationProcedure = publicProcedure
  .input(
    z.object({
      amount: z.number().positive(),
      type: z.enum(['one-time', 'monthly']),
      paymentMethod: z.enum(['card', 'bank', 'paypal']),
      userId: z.string(),
      userName: z.string(),
      userEmail: z.string(),
    })
  )
  .mutation(({ input }) => {
    const donation = {
      id: Date.now().toString(),
      ...input,
      status: 'completed' as const,
      createdAt: new Date().toISOString(),
    };

    donations.unshift(donation);
    console.log(`💰 New donation received: $${input.amount} from ${input.userName}`);
    return donation;
  });

export const listDonationsProcedure = publicProcedure
  .input(
    z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      userId: z.string().optional(),
    })
  )
  .query(({ input }) => {
    let filtered = donations;

    if (input.userId) {
      filtered = filtered.filter((d) => d.userId === input.userId);
    }

    const offset = input.offset || 0;
    const limit = input.limit || 50;

    return {
      donations: filtered.slice(offset, offset + limit),
      total: filtered.length,
      hasMore: offset + limit < filtered.length,
    };
  });

export const getDonationStatsProcedure = publicProcedure.query(() => {
  const total = donations.reduce((sum, d) => sum + d.amount, 0);
  const thisMonth = donations.filter(
    (d) => new Date(d.createdAt).getMonth() === new Date().getMonth()
  );
  const monthlyTotal = thisMonth.reduce((sum, d) => sum + d.amount, 0);

  return {
    totalDonations: total,
    monthlyDonations: monthlyTotal,
    donationCount: donations.length,
    monthlyCount: thisMonth.length,
  };
});