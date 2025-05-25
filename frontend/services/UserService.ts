import { User } from "types";

const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  return loggedInUserString ? JSON.parse(loggedInUserString).token : "";
};

const getAllUsers = () => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + "/users" + process.env.FK_USERS,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const signupUser = (user: User) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      "/users/signup" +
      process.env.FK_USERS_SIGNUP,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    }
  );
};

const loginUser = (user: User) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      "/users/login" +
      process.env.FK_USERS_LOGIN,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    }
  );
};

const UserService = {
  signupUser,
  loginUser,
  getAllUsers,
};

export default UserService;
