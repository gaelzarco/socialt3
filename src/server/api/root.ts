import { createTRPCRouter } from "~/server/api/trpc";
import { usersRouter } from "~/server/api/routers/users";
import { postsRouter } from "~/server/api/routers/posts";
import { repliesRouter } from "~/server/api/routers/replies";
import { likesRouter } from "~/server/api/routers/likes";
import { searchRouter } from "./routers/search";

export const appRouter = createTRPCRouter({
  users: usersRouter,
  posts: postsRouter,
  replies: repliesRouter,
  likes: likesRouter,
  search: searchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
