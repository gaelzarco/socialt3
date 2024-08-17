import type { NextPage } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import { UserProfile } from "@clerk/nextjs";
import { useTheme } from "next-themes";

import Header from "../components/header";
import { CaretLeftIcon } from "@radix-ui/react-icons";
import { Jelly } from "@uiball/loaders";
import { customFont } from "../_app";

const Account: NextPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="absolute bottom-10 left-0 right-0 top-0 flex min-h-screen w-screen cursor-default content-center rounded-xl dark:bg-black ">
      <div className="mx-auto">
        <Header noNav>
          <CaretLeftIcon
            className="h-6 w-6 rounded-full bg-neutral-200 hover:cursor-pointer hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
            onClick={() => {
              setLoading(true);
              router.push("/").catch((err) => console.log(err));
            }}
          />
          <h2 className="ml-5 text-2xl font-bold">Account Settings</h2>

          <span className="ml-5 flex flex-row content-center justify-center text-neutral-400">
            {loading && theme === "dark" && <Jelly color="white" size={15} />}
            {loading && theme === "light" && <Jelly color="black" size={15} />}
          </span>
        </Header>

        <UserProfile
          // appearance={{
          //   elements: {
          //     navbar: `${customFont.variable} font-sans bg-neutral-200 dark:bg-neutral-900 rounded-xl`,
          //     scrollBox: `${customFont.variable} font-sans bg-neutral-200 dark:bg-neutral-900`,
          //     userButtonPopoverCard: `${customFont.variable} font-sans bg-neutral-200 dark:bg-neutral-900`,
          //     card: `${customFont.variable} font-sans bg-neutral-200 dark:bg-neutral-900 rounded-xl`,
          //     profileSectionPrimaryButton: `${customFont.variable} font-sans text-[rgba(255, 255, 255, 1)]`,
          //     pageScrollBox: `${customFont.variable} bg-neutral-200 dark:bg-neutral-900 font-sans text-white`,
          //   },
          //   variables: {
          //     fontFamily: `${customFont.variable} font-sans`,
          //     colorTextOnPrimaryBackground: "white",
          //   },
          // }}
          routing="hash"
        />
      </div>
    </div>
  );
};

export default Account;
