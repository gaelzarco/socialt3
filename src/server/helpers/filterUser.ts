import { type User } from "@clerk/backend/dist/api";

const filterUser = (user: User) => {
  return {
    id: user.id,
    userName: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageURL: user.imageUrl,
    createdAt: user.createdAt,
  };
};

export default filterUser;
