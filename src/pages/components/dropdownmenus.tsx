import { useRef } from "react";
import { useRouter } from "next/router";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type RouterInputs, api } from "~/utils/api";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import Image from "next/image";

import Toast from "./toast";
import {
  PersonIcon,
  DotsHorizontalIcon,
  Pencil2Icon,
  CrumpledPaperIcon,
  EnterIcon,
  ExitIcon,
  GearIcon,
  CaretDownIcon,
} from "@radix-ui/react-icons";
import { customFont } from "../_app";
import Link from "next/link";

type PostAndReplyDelete = {
  postId?: RouterInputs["posts"]["deleteOneById"];
  replyId?: RouterInputs["replies"]["deleteOneById"];
  userId?: RouterInputs["users"]["getOneById"];
  postType: "POST" | "REPLY";
  deleteType: "FEED" | "POST" | "REPLY" | "PROFILE";
};

const PostOptionsDropDown: React.FC<PostAndReplyDelete> = ({
  postId,
  replyId,
  userId,
  postType,
  deleteType,
}) => {
  const context = api.useContext();
  const router = useRouter();
  const failedToastRef = useRef<{ publish: () => void }>();

  const postDelete = api.posts.deleteOneById.useMutation({
    onSuccess: () => {
      router.back();
    },
  });
  const postsDelete = api.posts.deleteOneById.useMutation({
    onSuccess: async () => {
      await context.posts.getAll.refetch().catch((err) => console.log(err));
    },
  });
  const repliesDelete = api.replies.deleteOneById.useMutation({
    onSuccess: async () => {
      await context.replies.getAllByPostId
        .refetch(postId)
        .catch((err) => console.log(err));
    },
  });
  const profilePostDelete = api.posts.deleteOneById.useMutation({
    onSuccess: async () => {
      await context.posts.getAllByUserId
        .refetch(userId)
        .catch((err) => console.log(err));
    },
  });
  const profileReplyDelete = api.replies.deleteOneById.useMutation({
    onSuccess: async () => {
      await context.replies.getAllByUserId
        .refetch(userId)
        .catch((err) => console.log(err));
    },
  });

  const deleteHandler = () => {
    if (postType === "POST" && deleteType === "POST" && postId) {
      postDelete.mutate(postId);
    } else if (postType === "POST" && deleteType === "FEED" && postId) {
      postsDelete.mutate(postId);
    } else if (
      postType === "REPLY" &&
      deleteType === "REPLY" &&
      postId &&
      replyId
    ) {
      repliesDelete.mutate(replyId);
    } else if (
      postType === "POST" &&
      deleteType === "PROFILE" &&
      userId &&
      postId
    ) {
      profilePostDelete.mutate(postId);
    } else if (
      postType === "REPLY" &&
      deleteType === "PROFILE" &&
      userId &&
      replyId
    ) {
      profileReplyDelete.mutate(replyId);
    } else {
      failedToastRef.current?.publish();
    }
  };

  return (
    <DropdownMenuPrimitive.Root>
      <Toast
        forwardedRef={failedToastRef}
        title={`${replyId ? "Reply" : "Post"}` + " could not be deleted."}
        error
      />

      <DropdownMenuPrimitive.Trigger asChild>
        <button
          className="inline-flex h-[20px] w-[30px] items-center justify-center rounded-full bg-neutral-200 outline-none hover:bg-neutral-300 dark:bg-neutral-800 hover:dark:bg-neutral-700"
          aria-label="Customise options"
        >
          <DotsHorizontalIcon />
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={`${customFont.variable} min-w-[150px] rounded-lg p-[5px] font-sans shadow-xl backdrop-blur-lg data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade dark:bg-neutral-700/30`}
          sideOffset={5}
        >
          <DropdownMenuPrimitive.Item className="data-[disabled] group relative flex h-[35px] select-none items-center rounded-lg px-[5px] pl-[15px] leading-none outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-neutral-500/10 dark:data-[highlighted]:text-neutral-100">
            Edit (coming soon)
            <div className="group-data-[disabled] ml-auto pl-[20px] dark:group-data-[highlighted]:text-neutral-100">
              <Pencil2Icon />
            </div>
          </DropdownMenuPrimitive.Item>
          <DropdownMenuPrimitive.Item
            onClick={() => {
              deleteHandler();
            }}
            className="data-[disabled] group relative flex h-[35px] select-none items-center rounded-lg px-[5px] pl-[15px] leading-none text-red-400 outline-none hover:bg-red-400/10 data-[disabled]:pointer-events-none"
          >
            Delete{" "}
            <div className="group-data-[disabled] ml-auto pl-[20px] text-red-400">
              <CrumpledPaperIcon />
            </div>
          </DropdownMenuPrimitive.Item>

          <DropdownMenuPrimitive.Arrow className="fill-neutral-100/30 backdrop-blur-md dark:fill-neutral-700/30" />
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};

export const UserNavDropDown: React.FC = () => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {!!isSignedIn && !!user ? (
          <div className="inline-flex items-center">
            <Image
              priority
              src={user.imageUrl}
              width={45}
              height={45}
              className="mr-0 h-12 w-12 rounded-full bg-neutral-200 hover:cursor-pointer dark:bg-neutral-800"
              alt="user avatar"
            />
          </div>
        ) : (
          <div className="inline-flex items-center">
            <PersonIcon className="mr-0 h-12 w-12 rounded-full bg-neutral-200 p-3 hover:cursor-pointer dark:bg-neutral-800" />
          </div>
        )}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={`${customFont.variable} z-20 min-w-[150px] rounded-lg p-[5px] font-sans shadow-xl backdrop-blur-lg data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade dark:bg-neutral-700/30`}
          sideOffset={5}
        >
          {!isSignedIn && (
            <DropdownMenuPrimitive.Item className="data-[disabled] group relative flex h-[35px] select-none items-center rounded-lg px-[5px] pl-[15px] leading-none outline-none hover:cursor-pointer hover:bg-neutral-400/10 data-[disabled]:pointer-events-none dark:text-neutral-100">
              <SignInButton>
                <div className="flex w-full flex-row justify-between">
                  <p>Sign-In</p>
                  <EnterIcon />
                </div>
              </SignInButton>
            </DropdownMenuPrimitive.Item>
          )}

          {!!isSignedIn && !!user && (
            <>
              <DropdownMenuPrimitive.Item className="data-[disabled] group relative flex h-[35px] select-none items-center rounded-lg px-[5px] pl-[15px] leading-none outline-none hover:cursor-pointer hover:bg-neutral-400/10 data-[disabled]:pointer-events-none dark:text-neutral-100">
                <Link
                  href={`/profile/${user.id}`}
                  className="flex w-full flex-row justify-between hover:cursor-pointer"
                >
                  <p>Profile</p>
                  <PersonIcon />
                </Link>
              </DropdownMenuPrimitive.Item>

              <DropdownMenuPrimitive.Item className="data-[disabled] group relative flex h-[35px] select-none items-center rounded-lg px-[5px] pl-[15px] leading-none outline-none hover:cursor-pointer hover:bg-neutral-400/10 data-[disabled]:pointer-events-none dark:text-neutral-100">
                <Link
                  href="/account"
                  className="flex w-full flex-row justify-between hover:cursor-pointer"
                >
                  <p>Account</p>
                  <GearIcon />
                </Link>
              </DropdownMenuPrimitive.Item>

              <DropdownMenuPrimitive.Item className="data-[disabled] group relative flex h-[35px] select-none items-center rounded-lg px-[5px] pl-[15px] leading-none text-red-400 outline-none hover:bg-red-400/10 data-[disabled]:pointer-events-none">
                <SignOutButton signOutCallback={router.reload}>
                  <div className="flex w-full flex-row justify-between hover:cursor-pointer">
                    <p>Sign-Out</p>
                    <ExitIcon />
                  </div>
                </SignOutButton>
              </DropdownMenuPrimitive.Item>
            </>
          )}

          <DropdownMenuPrimitive.Arrow className="fill-neutral-100/30 backdrop-blur-md dark:fill-neutral-700/30" />
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};

const SearchOptionsItems: React.FC<{
  category: string;
  setCategory: (category: string) => void;
}> = ({ category, setCategory }) => {
  return (
    <DropdownMenuPrimitive.Item
      className="data-[disabled] group relative flex h-[35px] select-none items-center rounded-lg px-[5px] pl-[15px] leading-none outline-none hover:cursor-pointer hover:bg-neutral-400/10 data-[disabled]:pointer-events-none dark:text-neutral-100"
      onClick={() => setCategory(category)}
    >
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </DropdownMenuPrimitive.Item>
  );
};

export const SearchOptionsDropDown: React.FC<{
  category: string;
  setCategory: (category: string) => void;
}> = ({ category, setCategory }) => {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button className="text-md inline-flex items-center rounded-full bg-neutral-200 p-2 px-4 text-black focus-within:outline-none hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700">
          <p>{category.charAt(0).toUpperCase() + category.slice(1)}</p>
          <CaretDownIcon className="ml-2 h-4 w-4" />
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={`${customFont.variable} min-w-[150px] rounded-lg bg-neutral-100/30 p-[5px] font-sans shadow-xl backdrop-blur-lg data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade dark:bg-neutral-700/30`}
          sideOffset={5}
        >
          <SearchOptionsItems
            key={"users"}
            category={"users"}
            setCategory={setCategory}
          />
          <SearchOptionsItems
            key={"posts"}
            category={"posts"}
            setCategory={setCategory}
          />
          <SearchOptionsItems
            key={"replies"}
            category={"replies"}
            setCategory={setCategory}
          />

          <DropdownMenuPrimitive.Arrow className="fill-neutral-100/30 backdrop-blur-lg dark:fill-neutral-700/30" />
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};

export default PostOptionsDropDown;
