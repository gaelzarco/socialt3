import type { NextPage } from "next";
import { useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { type RouterOutputs } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import CreateLike from "./createlike";
import ProfileHoverCard from "./profilehovercard";
import PostOptionsDropDown from "./dropdownmenus";
import Toast from "./toast";
import { Share1Icon } from "@radix-ui/react-icons";

type PostWithUserAndImage = RouterOutputs["posts"]["getOneById"];

const PostView: NextPage<PostWithUserAndImage> = (data) => {
  const authUser = useUser();
  const { post, user } = data;
  const toastRef = useRef<{ publish: () => void }>();

  return (
    <>
      <Toast forwardedRef={toastRef} title="Link copied to clipboard!" />

      {!!post && !!user && (
        <div
          key={post.id}
          className="mx-auto mt-5 w-11/12 cursor-default rounded-xl bg-neutral-100 p-8 text-left shadow-xl dark:bg-neutral-900 dark:text-white dark:shadow-none max-md:p-6"
        >
          <div className="flex leading-none">
            <div className="h-min">
              <ProfileHoverCard {...user} />
            </div>
            <div className="mb-1 w-full">
              <div className="mb-6 inline-flex w-full items-center justify-between">
                <div className="inline-flex content-center items-center justify-center">
                  <Link
                    href={`/profile/${user.id}`}
                    className="inline-flex content-center items-center justify-center hover:cursor-pointer"
                  >
                    <p className="pl-2 font-semibold">{user.firstName}</p>
                    <p className="text-md pl-2 text-neutral-500 max-sm:text-sm">
                      @{!user.userName ? "username" : user.userName}
                    </p>
                  </Link>
                  <p className="pl-1 text-sm text-neutral-500 max-sm:text-xs">
                    {` · ${dayjs(post.createdAt).fromNow()}`}
                  </p>
                </div>
                {authUser.user?.id === user.id && (
                  <PostOptionsDropDown
                    postId={post.id}
                    postType="POST"
                    deleteType="POST"
                  />
                )}
              </div>

              <h4 className="mb-6 pl-2 leading-5">{post.body}</h4>
              {post.link && (
                <Image
                  className="mb-4 h-auto w-full min-w-full rounded-3xl shadow-xl dark:shadow-none"
                  src={post.link}
                  height={300}
                  width={500}
                  alt="Attached Media for Post"
                />
              )}

              <div className="text-md mt-2 ml-1 inline-flex content-center items-center justify-center max-sm:text-sm">
                <div className="inline-flex w-auto justify-between">
                  <CreateLike
                    postId={post.id}
                    postType="POST"
                    likeType="POST"
                    liked={
                      post.likes.find(
                        (like) => like.userId === authUser.user?.id
                      )
                        ? true
                        : false
                    }
                    likesArrLength={post.likes.length}
                  />
                </div>
                <div className="inline-flex w-auto justify-between">
                  <p className="ml-10">
                    {post.replies.length > 1 || post.replies.length === 0
                      ? `${post.replies.length} replies`
                      : `${post.replies.length} reply`}
                  </p>
                </div>
                <Share1Icon
                  className="align-right ml-20 h-5 w-5 hover:cursor-pointer dark:text-white"
                  onClick={() => {
                    navigator.clipboard
                      .writeText(`https://moxie-x.vercel.app/post/${post.id}`)
                      .then(toastRef.current?.publish)
                      .catch((err) => console.log(err));
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostView;
