import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

import Header from "../components/header";
import ProfileView from "../components/profileview";
import FeedView from "../components/feedview";
import RepliesView from "../components/repliesview";
import Loading from "../components/loading";
import { CaretLeftIcon } from "@radix-ui/react-icons";

const Profile: NextPage<{ userId: string }> = ({ userId }) => {
  const userQuery = api.users.getOneById.useQuery(userId);
  const postsQuery = api.posts.getAllByUserId.useQuery(userId);
  const repliesQuery = api.replies.getAllByUserId.useQuery(userId);
  const router = useRouter();

  if (userQuery.isLoading || postsQuery.isLoading || repliesQuery.isLoading)
    return <Loading />;
  if (!userQuery.data || !postsQuery.data || !repliesQuery.data)
    return <div>Something went wrong...</div>;

  return (
    <>
      <Head>
        <title>{`Moxie · ${
          userQuery.data.filteredUser.firstName as string
        }`}</title>
        <meta
          name="description"
          content={
            `Checkout ${userQuery.data.filteredUser.firstName as string}` +
            "'s profile · Moxie"
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
            {`${userQuery.data.filteredUser.firstName as string}`}
          </h2>
        </Header>

        <div className="flex items-center justify-center">
          <div className="mx-auto w-full text-left">
            {!!userQuery.data && (
              <ProfileView
                filteredUser={userQuery.data.filteredUser}
                postCount={userQuery.data.postsCount}
                replyCount={userQuery.data.repliesCount}
              />
            )}
            {!!postsQuery.data && <FeedView posts={postsQuery.data} userView />}
            {!!repliesQuery.data && (
              <RepliesView replies={repliesQuery.data} userView />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const userId = context.params?.id;

  if (typeof userId !== "string") throw new Error("Invalid user ID");

  return {
    props: {
      userId,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default Profile;
