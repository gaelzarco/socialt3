import type { NextPage } from "next";
import { useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";
import autoAnimate from "@formkit/auto-animate";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import CreateLike from "./createlike";
import ProfileHoverCard from "./profilehovercard";
import PostOptionsDropDown from "./dropdownmenus";
import Toast from "./toast";
import { Share1Icon, PaperPlaneIcon } from "@radix-ui/react-icons";
import Header from "./header";

type Replies = {
  replies:
    | RouterOutputs["replies"]["getAllByPostId"]
    | RouterOutputs["replies"]["getAllByUserId"];
  userView?: boolean;
};

const RepliesView: NextPage<Replies> = ({ replies, userView }) => {
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
        <h2 className="ml-5 mt-2 text-2xl font-semibold">Replies</h2>
      </Header>

      {!replies ||
        (Object.keys(replies).length === 0 && (
          <div className="mb-20 mt-5 flex w-11/12 cursor-default flex-col content-center items-center justify-center rounded-xl p-5 text-center text-neutral-500">
            <h1>Nothing to see here</h1>
          </div>
        ))}

      <div ref={parent} className="h-auto w-full">
        {!!replies &&
          Object.values(replies).map(({ reply, user, postUser }) => {
            return (
              <div
                key={reply.id}
                className="mx-auto mb-4 mt-5 w-11/12 cursor-default rounded-xl bg-neutral-100 p-8 text-left shadow-xl dark:bg-neutral-900 dark:text-white dark:shadow-none max-md:p-6"
              >
                {userView && (
                  <div className="mb-6 ml-2 text-sm">
                    <Link
                      href={`/post/${reply.postId}`}
                      className="flex flex-col"
                    >
                      <div className="inline-flex items-center text-neutral-500">
                        <PaperPlaneIcon className="mr-5 mt-1 h-3 w-3" />
                        <p>
                          {"In reply to " +
                            `${postUser?.firstName as string}` +
                            "'s post"}
                        </p>
                        <div className="ml-2 inline-flex h-6 w-6 items-center rounded-full border border-neutral-700">
                          <Image
                            src={user.profileImageURL}
                            alt="User Profile"
                            width={100}
                            height={100}
                            className="h-full w-full rounded-full"
                          />
                        </div>
                      </div>

                      <div className="ml-8 mt-2 flex flex-col text-neutral-400">
                        <p>
                          {reply.post.body.length > 40
                            ? reply.post.body.slice(0, 40) + "..."
                            : reply.post.body}
                        </p>
                      </div>
                    </Link>
                  </div>
                )}
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
                          {` · ${dayjs(reply.createdAt).fromNow()}`}
                        </p>
                      </div>
                      {authUser.user?.id === user.id && userView && (
                        <PostOptionsDropDown
                          userId={user.id}
                          replyId={reply.id}
                          postType="REPLY"
                          deleteType="PROFILE"
                        />
                      )}
                      {authUser.user?.id === user.id && !userView && (
                        <PostOptionsDropDown
                          postId={reply.postId}
                          replyId={reply.id}
                          postType="REPLY"
                          deleteType="REPLY"
                        />
                      )}
                    </div>

                    <h4 className="mb-6 pl-2 leading-5">{reply.body}</h4>
                    {reply.link && (
                      <Image
                        className="mb-4 h-auto w-full min-w-full rounded-3xl shadow-xl dark:shadow-none"
                        src={reply.link}
                        height={300}
                        width={500}
                        alt="Attached Media for Post"
                      />
                    )}

                    <div className="text-md ml-1 mt-2 inline-flex content-center items-center justify-center max-sm:text-sm">
                      <div className="inline-flex w-auto justify-between">
                        <CreateLike
                          postId={reply.postId}
                          replyId={reply.id}
                          postType="REPLY"
                          likeType="REPLY"
                          liked={
                            reply.likes.find(
                              (like) => like.userId === authUser.user?.id
                            )
                              ? true
                              : false
                          }
                          likesArrLength={reply.likes.length}
                        />
                      </div>
                      <Share1Icon
                        className="align-right ml-16 h-5 w-5 hover:cursor-pointer dark:text-white"
                        onClick={() => {
                          navigator.clipboard
                            .writeText(
                              `https://moxie-x.vercel.app/post/${reply.postId}`
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

export default RepliesView;
