import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import filterUserForPost from "~/server/helpers/filterUserForPost";
import filterUserForReply from "~/server/helpers/filterUserForReply";

export const searchRouter = createTRPCRouter({
  findUser: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const users = await clerkClient.users
        .getUserList({
          query: input.query,
          limit: 15,
        })
        .then((users) => users.data);

      return users;
    }),

  findPost: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          body: {
            contains: input.query,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
        take: 15,
      });

      const users = (
        await clerkClient.users.getUserList({
          userId: posts.map((post) => post.userId),
          limit: 15,
        })
      ).data.map(filterUserForPost);

      return posts.map((post) => {
        const user = users.find((user) => user.id === post.userId);

        if (!user)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User for post not found",
          });

        return {
          post,
          user,
        };
      });
    }),

  findReply: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const replies = await ctx.prisma.reply.findMany({
        where: {
          body: {
            contains: input.query,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          post: {
            select: {
              userId: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        take: 15,
      });

      const users = (
        await clerkClient.users.getUserList({
          userId: replies.map((reply) => reply.userId),
          limit: 15,
        })
      ).data.map(filterUserForPost);

      const postUsers = (
        await clerkClient.users.getUserList({
          userId: replies.map((reply) => reply.post.userId),
        })
      ).data.map(filterUserForReply);

      return replies.map((reply) => {
        const user = users.find((user) => user.id === reply.userId);
        const postUser = postUsers.find(
          (user) => user.id === reply.post.userId
        );

        if (!user)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User for reply not found",
          });

        return {
          reply,
          user,
          postUser,
        };
      });
    }),
});
