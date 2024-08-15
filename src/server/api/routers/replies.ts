import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { uploadFile, getFileURL, deleteFile } from "~/server/api/s3";
import filterUserForPost from "~/server/helpers/filterUserForPost";
import filterUserForReply from "~/server/helpers/filterUserForReply";
import { postLimiter } from "../ratelimiters";

export const repliesRouter = createTRPCRouter({
  getAllByPostId: publicProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      const replies = await ctx.prisma.reply.findMany({
        where: {
          postId: input,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          likes: {
            select: {
              userId: true,
            },
          },
          post: {
            select: {
              userId: true,
              body: true,
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

      const repliesWithMediaLinks = await Promise.all(
        replies.map(async (reply) => {
          if (reply.media === null) return reply;

          const replyImgLink = await getFileURL(reply.media);
          reply.link = replyImgLink;
          return reply;
        })
      );

      return repliesWithMediaLinks.map((reply) => {
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

  getAllByUserId: publicProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      const replies = await ctx.prisma.reply.findMany({
        where: {
          userId: input,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          likes: {
            select: {
              userId: true,
            },
          },
          post: {
            select: {
              userId: true,
              body: true,
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

      const repliesWithMediaLinks = await Promise.all(
        replies.map(async (reply) => {
          if (reply.media === null) return reply;

          const replyImgLink = await getFileURL(reply.media);
          reply.link = replyImgLink;
          return reply;
        })
      );

      return repliesWithMediaLinks.map((reply) => {
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

  createOne: protectedProcedure
    .input(
      z.object({
        body: z.string().min(1).max(500),
        media: z
          .object({
            buffer: z.string(),
            mimetype: z.string(),
          })
          .nullable(),
        postId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const fileName = input.media ? await uploadFile(input.media) : null;

      const { success } = await postLimiter.limit(ctx.userId);

      if (!success)
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have made too many requests. Please try again later.",
        });

      return ctx.prisma.reply.create({
        data: {
          userId: ctx.userId,
          body: input.body,
          postId: input.postId,
          media: fileName,
        },
      });
    }),

  deleteOneById: protectedProcedure
    .input(z.string().min(1))
    .mutation(async ({ ctx, input }) => {
      const reply = await ctx.prisma.reply.findUnique({
        where: {
          id: input,
        },
      });

      if (!reply)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reply not found.",
        });

      if (reply.userId !== ctx.userId)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this reply.",
        });

      if (reply.media !== null) {
        try {
          await deleteFile(reply.media);
        } catch (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error deleting post media. Try again.",
          });
        }
      }

      return await ctx.prisma.reply.delete({
        where: {
          id: input,
        },
      });
    }),
});
