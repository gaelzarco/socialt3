import type { NextPage } from "next";
import { useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import type { RouterOutputs } from "~/utils/api";
import Link from "next/link";
import autoAnimate from "@formkit/auto-animate";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import Header from "./header";
import CreateLike from "./createlike";
import ProfileHoverCard from "./profilehovercard";
import AspectRatioImage from "./aspectratioimage";
import PostOptionsDropDown from "./dropdownmenus";
import Toast from "./toast";
import { Share1Icon, ChatBubbleIcon } from "@radix-ui/react-icons";

type Posts = {
  posts:
    | RouterOutputs["posts"]["getAll"]
    | RouterOutputs["posts"]["getAllByUserId"];
  userView?: boolean;
};

const FeedView: NextPage<Posts> = ({ posts, userView }) => {
  const authUser = useUser();
  const toastRef = useRef<{ publish: () => void }>();
  const parent = useRef(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  return (
    <>
      <Toast forwardedRef={toastRef} title="Link copied to clipboard!" />

      <Header noNav>
        <h2 className="ml-5 mt-2 text-2xl font-semibold">Posts</h2>
      </Header>

      {!posts ||
        (Object.keys(posts).length === 0 && (
          <div className="mb-20 mt-5 flex w-11/12 cursor-default flex-col content-center items-center justify-center rounded-xl p-5 text-center text-neutral-500">
            <h1>Nothing to see here</h1>
          </div>
        ))}

      <div ref={parent} className="h-auto w-full">
        {!!posts &&
          Object.values(posts).map(({ post, user }) => {
            return (
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
                      {authUser.user?.id === user.id && userView && (
                        <PostOptionsDropDown
                          userId={user.id}
                          postId={post.id}
                          postType="POST"
                          deleteType="PROFILE"
                        />
                      )}
                      {authUser.user?.id === user.id && !userView && (
                        <PostOptionsDropDown
                          postId={post.id}
                          postType="POST"
                          deleteType="FEED"
                        />
                      )}
                    </div>

                    <Link href={`/post/${post.id}`} className="w-full">
                      <h4 className="mb-6 pl-2 leading-5">{post.body}</h4>
                      {post.link && (
                        <AspectRatioImage
                          src={post.link}
                          alt="Attached Media for Post"
                        />
                      )}
                    </Link>

                    <div className="text-md ml-1 mt-2 inline-flex content-center items-center justify-center max-sm:text-sm">
                      <div className="inline-flex w-auto justify-between">
                        <CreateLike
                          postId={post.id}
                          postType="POST"
                          likeType="FEED"
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
                        <Link href={`/post/${post.id}`} className="flex">
                          <ChatBubbleIcon className="ml-16 h-5 w-5 hover:cursor-pointer dark:text-white" />
                          <p className="ml-2">{post._count.replies}</p>
                        </Link>
                      </div>
                      <Share1Icon
                        className="align-right ml-16 h-5 w-5 hover:cursor-pointer dark:text-white"
                        onClick={() => {
                          navigator.clipboard
                            .writeText(
                              `https://moxie-x.vercel.app/post/${post.id}`
                            )
                            .then(toastRef.current?.publish)
                            .catch((err) => console.log(err));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default FeedView;
