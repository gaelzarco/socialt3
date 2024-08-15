import { type User } from "@clerk/backend/dist/api";

const filterUserForReply = (user: User) => {
  return {
    id: user.id,
    profileImageUrl: user.imageUrl,
    firstName: user.firstName,
  };
};

export default filterUserForReply;
