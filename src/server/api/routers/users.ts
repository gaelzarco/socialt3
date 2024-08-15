import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import filterUser from "~/server/helpers/filterUser";

export const usersRouter = createTRPCRouter({
  getOneById: publicProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      const foundUser = await clerkClient.users.getUser(input);

      const postsCount = await ctx.prisma.post.count({
        where: {
          userId: input,
        },
      });

      const repliesCount = await ctx.prisma.reply.count({
        where: {
          userId: input,
        },
      });

      if (!foundUser)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });

      const filteredUser = filterUser(foundUser);

      if (!filteredUser)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User could not be filtered properly",
        });

      return {
        filteredUser,
        postsCount,
        repliesCount,
      };
    }),
});
