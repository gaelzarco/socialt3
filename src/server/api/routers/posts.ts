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
import { postLimiter } from "../ratelimiters";

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
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

    const postsWithMediaLinks = await Promise.all(
      posts.map(async (post) => {
        if (post.media === null) return post;

        const postImgLink = await getFileURL(post.media);
        post.link = postImgLink;
        return post;
      })
    );

    return postsWithMediaLinks.map((post) => {
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

  getOneById: publicProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input,
        },
        include: {
          likes: {
            select: {
              userId: true,
            },
          },
          replies: true,
        },
      });

      if (!post)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Post not found",
        });

      const foundUser = await clerkClient.users.getUser(post.userId);

      if (!foundUser)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User for post not found",
        });

      const postWithMediaLink = async () => {
        if (post.media === null) return post;

        const postImgLink = await getFileURL(post.media);
        post.link = postImgLink;
        return post;
      };

      return postWithMediaLink().then((post) => {
        const user = filterUserForPost(foundUser);

        return {
          post,
          user,
        };
      });
    }),

  getAllByUserId: publicProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
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
          _count: {
            select: {
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

      const postsWithMediaLinks = await Promise.all(
        posts.map(async (post) => {
          if (post.media === null) return post;

          const postImgLink = await getFileURL(post.media);
          post.link = postImgLink;
          return post;
        })
      );

      return postsWithMediaLinks.map((post) => {
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

      return await ctx.prisma.post.create({
        data: {
          userId: ctx.userId,
          body: input.body,
          media: fileName,
        },
      });
    }),

  deleteOneById: protectedProcedure
    .input(z.string().min(1))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input,
        },
      });

      if (!post)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Post not found",
        });

      if (post.userId !== ctx.userId)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this post.",
        });

      if (post.media !== null) {
        try {
          await deleteFile(post.media);
        } catch (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error deleting post media. Try again.",
          });
        }
      }

      return await ctx.prisma.post.delete({
        where: {
          id: input,
        },
      });
    }),
});
