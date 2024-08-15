import { type User } from "@clerk/backend/dist/api";

const filterUserForPost = (user: User) => {
  return {
    id: user.id,
    userName: user.username,
    firstName: user.firstName,
    profileImageURL: user.imageUrl,
  };
};

export default filterUserForPost;
