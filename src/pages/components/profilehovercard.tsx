import type { NextPage } from "next";
import { type RouterOutputs } from "~/utils/api";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import Image from "next/image";
import Link from "next/link";

import { customFont } from "../_app";

type PostUser = RouterOutputs["posts"]["getOneById"]["user"];

const ProfileHoverCard: NextPage<PostUser> = ({
  profileImageURL,
  id,
  firstName,
  userName,
}) => (
  <HoverCardPrimitive.Root openDelay={400} closeDelay={100}>
    <HoverCardPrimitive.Trigger asChild>
      <Link href={`/profile/${id}`}>
        <Image
          height={50}
          width={50}
          className="h-[50px] w-[54px] cursor-pointer rounded-full bg-neutral-800 max-md:w-[60px]"
          src={profileImageURL}
          alt="Profile Picture"
        />
      </Link>
    </HoverCardPrimitive.Trigger>

    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        className={`${customFont.variable} w-48 cursor-pointer rounded-xl p-5 font-sans shadow-xl backdrop-blur-lg data-[side=bottom]:animate-slideUpAndFade data-[side=right]:animate-slideLeftAndFade data-[side=left]:animate-slideRightAndFade data-[side=top]:animate-slideDownAndFade data-[state=open]:transition-all dark:bg-neutral-700/30`}
      >
        <Link href={`/profile/${id}`}>
          <div className="flex flex-col gap-7">
            <Image
              className="h-16 w-16 rounded-full bg-neutral-800/30"
              src={profileImageURL}
              alt="User Avatar"
              width={60}
              height={60}
            />

            <div className="gap-15 flex flex-col">
              <div className="leading-5">
                <div className="font-bold dark:text-white">{firstName}</div>
                <div className="text-neutral-00 dark:text-neutral-400">
                  @{userName}
                </div>
              </div>
            </div>
          </div>
          <HoverCardPrimitive.Arrow className="fill-neutral-100/30 backdrop-blur-md dark:fill-neutral-700/30" />
        </Link>
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  </HoverCardPrimitive.Root>
);

export default ProfileHoverCard;
