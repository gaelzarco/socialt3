import type { NextPage } from "next";
import { useState, useRef } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { type RouterInputs, api } from "~/utils/api";

import { HeartIcon, HeartFilledIcon } from "@radix-ui/react-icons";
import Toast from "./toast";

type Like = {
  postId: RouterInputs["likes"]["handlePostLike"]["postId"];
  replyId?: RouterInputs["likes"]["handleReplyLike"]["replyId"];
  postType:
    | RouterInputs["likes"]["handlePostLike"]["postType"]
    | RouterInputs["likes"]["handleReplyLike"]["postType"];
  likeType: "FEED" | "POST" | "REPLY";
  liked?: boolean;
  likesArrLength: number;
};

const CreateLike: NextPage<Like> = ({
  postId,
  replyId,
  postType,
  likeType,
  liked,
  likesArrLength,
}) => {
  const { isSignedIn } = useUser();
  const context = api.useContext();

  const [likedBool, setLikedBool] = useState(liked);
  const [likesLength, setLikesLength] = useState(likesArrLength);
  const [errMsg, setErrMsg] = useState("");
  const failedToastRef = useRef<{ publish: () => void }>();

  const likeFailure = (err: string) => {
    setErrMsg(err);
    failedToastRef.current?.publish();
    setLikedBool(!likedBool);
    setLikesLength(!likedBool ? likesLength + 1 : likesLength - 1);
  };

  const postLike = api.likes.handlePostLike.useMutation({
    onSuccess: async () => {
      await context.posts.getOneById
        .refetch(postId)
        .catch((err) => console.log(err));
    },
    onError: (err) => likeFailure(err.message),
  });
  const postsLike = api.likes.handlePostLike.useMutation({
    onSuccess: async () => {
      await context.posts.getAll.refetch().catch((err) => console.log(err));
    },
    onError: (err) => likeFailure(err.message),
  });
  const replyLike = api.likes.handleReplyLike.useMutation({
    onSuccess: async () => {
      await context.replies.getAllByPostId
        .refetch(postId)
        .catch((err) => console.log(err));
    },
    onError: (err) => likeFailure(err.message),
  });

  const likeHandler = () => {
    if (likeType === "POST" && postType === "POST" && postId) {
      postLike.mutate({ postId: postId, postType: postType });
    } else if (likeType === "FEED" && postType === "POST" && postId) {
      postsLike.mutate({ postId: postId, postType: postType });
    } else if (likeType === "REPLY" && postType === "REPLY" && replyId) {
      replyLike.mutate({ replyId: replyId, postType: postType });
    } else {
      failedToastRef.current?.publish();
    }
  };

  if (!isSignedIn)
    return (
      <>
        <SignInButton>
          <HeartIcon className="h-5 w-5 text-black hover:cursor-default dark:text-white" />
        </SignInButton>
        <p className="ml-2">{likesLength}</p>
      </>
    );

  return (
    <>
      <Toast forwardedRef={failedToastRef} title={errMsg} error />

      {likedBool ? (
        <HeartFilledIcon
          className="h-5 w-5 text-red-500 hover:cursor-pointer"
          onClick={() => {
            likeHandler();
            setLikedBool(!likedBool);
            setLikesLength(!likedBool ? likesLength + 1 : likesLength - 1);
          }}
        />
      ) : (
        <HeartIcon
          className="h-5 w-5 text-black hover:cursor-pointer dark:text-white"
          onClick={() => {
            likeHandler();
            setLikedBool(!likedBool);
            setLikesLength(!likedBool ? likesLength + 1 : likesLength - 1);
          }}
        />
      )}
      <p className="ml-2">{likesLength}</p>
    </>
  );
};

export default CreateLike;
