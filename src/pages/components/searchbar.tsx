import {
  type FormEvent,
  type MouseEvent,
  type KeyboardEvent,
  useState,
  useRef,
} from "react";
import type { MutationStatus } from "@tanstack/react-query";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

import Toast from "./toast";
import { SearchOptionsDropDown } from "./dropdownmenus";
import {
  CrumpledPaperIcon,
  MagnifyingGlassIcon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";
import { Jelly } from "@uiball/loaders";

type UserSearchType = RouterOutputs["search"]["findUser"];
type PostSearchType = RouterOutputs["search"]["findPost"];
type ReplySearchType = RouterOutputs["search"]["findReply"];

export default function SearchBar() {
  const [searchCategory, setSearchCategory] = useState<string>("users");
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [userResult, setUserResult] = useState<UserSearchType | null>(null);
  const [postResult, setPostResult] = useState<PostSearchType | null>(null);
  const [replyResult, setReplyResult] = useState<ReplySearchType | null>(null);

  const failedToastRef = useRef<{ publish: () => void }>();
  const searchBarRef = useRef<HTMLInputElement>(null);

  const { theme } = useTheme();

  const setSearchCategoryHandler = (category: string) => {
    setSearchCategory(category);

    setUserResult(null);
    setPostResult(null);
    setReplyResult(null);
    setSearchQuery(null);

    userSearchMutation.reset();
    postSearchMutation.reset();
    replySearchMutation.reset();
  };

  const setSearchQueryHandler = (query: string) => {
    setSearchQuery(query);

    setUserResult(null);
    setPostResult(null);
    setReplyResult(null);

    userSearchMutation.reset();
    postSearchMutation.reset();
    replySearchMutation.reset();
  };

  const resetSearchBar = (e: MouseEvent) => {
    e.preventDefault();

    setUserResult(null);
    setPostResult(null);
    setReplyResult(null);
    setSearchQuery(null);

    userSearchMutation.reset();
    postSearchMutation.reset();
    replySearchMutation.reset();
  };

  const userSearchMutation = api.search.findUser.useMutation({
    onSuccess: (data) => {
      if (data.length === 0) {
        setErrMsg("No users found");
        failedToastRef.current?.publish();
      }
      setUserResult(data);
    },
    onError: (err) => {
      setErrMsg(err.message);
      failedToastRef.current?.publish();
      return;
    },
  });

  const postSearchMutation = api.search.findPost.useMutation({
    onSuccess: (data) => {
      if (data.length === 0) {
        setErrMsg("No posts found");
        failedToastRef.current?.publish();
      }
      setPostResult(data);
    },
    onError: (err) => {
      setErrMsg(err.message);
      failedToastRef.current;
      return;
    },
  });

  const replySearchMutation = api.search.findReply.useMutation({
    onSuccess: (data) => {
      if (data.length === 0) {
        setErrMsg("No replies found");
        failedToastRef.current?.publish();
      }
      setReplyResult(data);
    },
    onError: (err) => {
      setErrMsg(err.message);
      failedToastRef.current;
      return;
    },
  });

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
      hideKeyboard();
    }
  };

  const hideKeyboard = () => {
    if (searchBarRef.current) {
      searchBarRef.current.blur();
    }
  };

  const handleSubmit = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!searchQuery) {
      setErrMsg("Search query cannot be empty");
      failedToastRef.current?.publish();
      return;
    } else if (searchCategory === "users" && searchQuery.length < 3) {
      setErrMsg("Search for users must be 3 characters or more");
      failedToastRef.current?.publish();
      return;
    }

    if (searchCategory === "users" && searchQuery.length > 2)
      userSearchMutation.mutate({ query: searchQuery });
    if (searchCategory === "posts")
      postSearchMutation.mutate({ query: searchQuery });
    if (searchCategory === "replies")
      replySearchMutation.mutate({ query: searchQuery });
  };

  return (
    <>
      <Toast forwardedRef={failedToastRef} title={errMsg as string} error />

      <div className="mx-auto flex w-11/12 items-center rounded-xl bg-neutral-100 text-white shadow-xl backdrop-blur-2xl dark:bg-neutral-900 dark:shadow-none">
        <div className="mr-2 flex flex-row items-center px-2 py-2">
          <SearchOptionsDropDown
            category={searchCategory}
            setCategory={setSearchCategoryHandler}
          />
        </div>
        <form
          className="mr-4 inline-flex h-full w-full items-center"
          onSubmit={handleSubmit}
        >
          <input
            ref={searchBarRef}
            onKeyDown={handleKeyPress}
            type="text"
            placeholder="Search"
            className="text-md h-full w-full bg-transparent py-2 pr-2 text-black focus-within:outline-none dark:text-white"
            value={searchQuery || ""}
            onChange={(e) => setSearchQueryHandler(e.target.value)}
          />

          {(userSearchMutation.isLoading ||
            postSearchMutation.isLoading ||
            replySearchMutation.isLoading) && (
            <div className="mr-3 flex items-center self-center bg-transparent text-black dark:text-white">
              {theme === "dark" ? (
                <Jelly size={15} color="#fff" />
              ) : (
                <Jelly size={15} color="#000" />
              )}
            </div>
          )}

          <button
            type="submit"
            className="mr-2 flex min-h-[30px] min-w-[30px] content-center items-center justify-center rounded-full bg-neutral-200 text-black hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
          >
            <MagnifyingGlassIcon />
          </button>

          <button
            className="flex min-h-[30px] min-w-[30px] content-center items-center justify-center rounded-full bg-neutral-200 text-black hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
            onClick={(e) => resetSearchBar(e as MouseEvent<HTMLButtonElement>)}
          >
            <CrumpledPaperIcon />
          </button>
        </form>
      </div>

      {userResult && searchCategory === "users" && (
        <UserSearchComponent
          userResult={userResult}
          userSearchMutationStatus={userSearchMutation.status}
        />
      )}

      {postResult && searchCategory === "posts" && (
        <PostSearchComponent
          postResult={postResult}
          postSearchMutationStatus={postSearchMutation.status}
        />
      )}

      {replyResult && searchCategory === "replies" && (
        <ReplySearchComponent
          replyResult={replyResult}
          replySearchMutationStatus={replySearchMutation.status}
        />
      )}
    </>
  );
}

function UserSearchComponent({
  userResult,
  userSearchMutationStatus,
}: {
  userResult: UserSearchType;
  userSearchMutationStatus: MutationStatus;
}) {
  return (
    <>
      {userResult.length > 1 && userSearchMutationStatus === "success" && (
        <div className="mx-8 mt-4 flex max-h-[400px] flex-col items-center overflow-y-auto overflow-x-hidden rounded-xl bg-neutral-100 bg-transparent p-2 text-black shadow-xl dark:bg-neutral-900 dark:text-white dark:shadow-none max-lg:max-h-[300px] max-md:text-sm">
          {userResult.map((user, idx) => {
            return (
              <Link
                href={`/profile/${user.id}`}
                key={idx}
                className="my-1 flex w-full cursor-pointer flex-row rounded-xl border border-neutral-300 bg-neutral-100 p-4 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                <div className="inline-flex h-10 w-10 items-center rounded-full border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900">
                  <Image
                    src={user.imageUrl}
                    alt="User Profile"
                    width={100}
                    height={100}
                    className="h-full w-full rounded-full"
                  />
                </div>
                <div className="-mt-1 ml-4 flex flex-col">
                  <p className="text-md font-semibold leading-8 text-black dark:text-white max-md:text-sm ">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 max-md:text-xs">
                    @{!user.username ? "username" : user.username}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

function PostSearchComponent({
  postResult,
  postSearchMutationStatus,
}: {
  postResult: PostSearchType;
  postSearchMutationStatus: MutationStatus;
}) {
  return (
    <>
      {postResult.length > 0 && postSearchMutationStatus === "success" && (
        <div className="mx-8 mt-4 flex max-h-[400px] flex-col items-center overflow-y-auto overflow-x-hidden rounded-xl bg-neutral-100 bg-transparent p-2 text-black shadow-xl dark:bg-neutral-900 dark:text-white dark:shadow-none max-lg:max-h-[300px] max-md:text-sm">
          {Object.values(postResult).map(({ post, user }, idx) => {
            return (
              <Link
                href={`/post/${post.id}`}
                key={idx}
                className="my-1 flex w-full cursor-pointer flex-col rounded-xl border border-neutral-300 bg-neutral-100 p-4 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 max-md:pb-6"
              >
                <div className="flex flex-row">
                  <div className="inline-flex h-10 w-10 items-center rounded-full border border-neutral-700">
                    <Image
                      src={user.profileImageURL}
                      alt="User Profile"
                      width={100}
                      height={100}
                      className="h-full w-full rounded-full"
                    />
                  </div>
                  <div className="-mt-2 ml-4 flex flex-row items-center text-center">
                    <p className="text-md font-semibold leading-5 max-md:text-sm">
                      {user.firstName}
                    </p>
                    <p className="ml-2 text-sm text-neutral-500 dark:text-neutral-400 max-md:text-xs">
                      @{user.userName}
                    </p>
                  </div>
                </div>

                <div className="flex w-full flex-col pl-14">
                  <p>
                    {post.body.length > 60
                      ? `${post.body.slice(0, 60)}...`
                      : post.body}
                  </p>

                  {post.media && (
                    <div className="mt-2 flex max-w-[150px] flex-row items-center justify-between">
                      <p className="text-sm text-neutral-500 max-md:text-xs">
                        Attached Media
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex max-w-[150px] flex-row items-center justify-between">
                    <p className="text-sm text-neutral-500 max-md:text-xs">
                      {post._count.likes > 1 || post._count.likes === 0
                        ? `${post._count.likes} likes`
                        : `${post._count.likes} like`}
                    </p>
                    <p className="text-sm text-neutral-500 max-md:text-xs">
                      {post._count.replies > 1 || post._count.replies === 0
                        ? `${post._count.replies} replies`
                        : `${post._count.replies} reply`}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

function ReplySearchComponent({
  replyResult,
  replySearchMutationStatus,
}: {
  replyResult: ReplySearchType;
  replySearchMutationStatus: MutationStatus;
}) {
  return (
    <>
      {replyResult.length > 0 && replySearchMutationStatus === "success" && (
        <div className="mx-8 mt-4 flex max-h-[400px] flex-col items-center overflow-y-auto overflow-x-hidden rounded-xl bg-neutral-100 bg-transparent p-2 text-black shadow-xl dark:bg-neutral-900 dark:text-white dark:shadow-none max-lg:max-h-[300px] max-md:text-sm">
          {Object.values(replyResult).map(({ reply, user, postUser }, idx) => {
            return (
              <Link
                href={`/post/${reply.postId}`}
                key={idx}
                className="my-1 flex w-full cursor-pointer flex-col rounded-xl border border-neutral-300 bg-neutral-100 p-4 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 max-md:pb-6"
              >
                <div className="mb-2 ml-1 flex flex-row items-center">
                  <PaperPlaneIcon className="mr-4 h-3 w-3 text-neutral-500" />
                  <p className="text-sm text-neutral-500 max-md:text-xs">
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

                <div className="flex flex-row">
                  <div className="inline-flex h-10 w-10 items-center rounded-full border border-neutral-700">
                    <Image
                      src={user.profileImageURL}
                      alt="User Profile"
                      width={100}
                      height={100}
                      className="h-full w-full rounded-full"
                    />
                  </div>
                  <div className="-mt-2 ml-4 flex flex-row items-center text-center">
                    <p className="text-md font-semibold leading-5 max-md:text-sm">
                      {user.firstName}
                    </p>
                    <p className="ml-2 text-sm text-neutral-500 dark:text-neutral-400 max-md:text-xs">
                      @{user.userName}
                    </p>
                  </div>
                </div>

                <div className="flex w-full flex-col pl-14">
                  <p>
                    {reply.body.length > 60
                      ? `${reply.body.slice(0, 60)}...`
                      : reply.body}
                  </p>

                  {reply.media && (
                    <div className="mt-2 flex max-w-[150px] flex-row items-center justify-between">
                      <p className="text-sm text-neutral-500 max-md:text-xs">
                        Attached Media
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex max-w-[150px] flex-row items-center justify-between">
                    <p className="text-sm text-neutral-500 max-md:text-xs">
                      {reply._count.likes > 1 || reply._count.likes === 0
                        ? `${reply._count.likes} likes`
                        : `${reply._count.likes} like`}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
