import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { TRPCError } from "@trpc/server";

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'guest';
  avatar?: string;
}

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get('authorization');
  let user: User | null = null;
  
  if (authHeader) {
    try {
      const userData = JSON.parse(authHeader);
      user = userData as User;
    } catch (e) {
      console.error('Failed to parse auth header:', e);
    }
  }
  
  return {
    req: opts.req,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);