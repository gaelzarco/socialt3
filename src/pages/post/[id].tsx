import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";

import Header from "../components/header";
import CreatePost from "../components/createpost";
import PostView from "../components/postview";
import RepliesView from "../components/repliesview";
import Loading from "../components/loading";
import { CaretLeftIcon } from "@radix-ui/react-icons";

const Post: NextPage<{ postId: string }> = ({ postId }) => {
  const postQuery = api.posts.getOneById.useQuery(postId);
  const replyQuery = api.replies.getAllByPostId.useQuery(postId);
  const { isSignedIn } = useUser();
  const router = useRouter();

  if (postQuery.isLoading || replyQuery.isLoading) return <Loading />;
  if (!postQuery.data || !replyQuery.data)
    return <div>Something went wrong...</div>;

  return (
    <>
      <Head>
        <title>
          {`Moxie · ${postQuery.data.user.firstName as string}` + "'s Post"}
        </title>
        <meta
          name="description"
          content={
            `Checkout ${postQuery.data.user.firstName as string}` +
            "'s post · Moxie"
          }
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="h-auto min-h-screen w-full max-w-[750px] dark:bg-black">
        <Header>
          <CaretLeftIcon
            className="h-6 w-6 rounded-full bg-neutral-200 hover:cursor-pointer hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
            onClick={router.back}
          />
          <h2 className="ml-5 text-2xl font-bold">
            {`${postQuery.data.user.firstName as string}` + "'s Post"}
          </h2>
        </Header>

        <div className="flex items-center justify-center">
          <div className="mx-auto w-full text-left">
            {!!postQuery.data && <PostView {...postQuery.data} />}
            {!!isSignedIn && <CreatePost postId={postId} reply />}
            {!!replyQuery.data && <RepliesView replies={replyQuery.data} />}
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const postId = context.params?.id;

  if (typeof postId !== "string") throw new Error("Invalid post ID");

  return {
    props: {
      postId,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default Post;
