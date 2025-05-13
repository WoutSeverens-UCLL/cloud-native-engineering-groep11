import classNames from "classnames";
import { useRouter } from "next/router";
import React, { useState } from "react";
import UserService from "@services/UserService";
import { StatusMessage } from "@types";

const UserLoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const router = useRouter();

  const clearErrors = () => {
    setEmailError(null);
    setPasswordError(null);
    setStatusMessages([]);
  };

  const validate = (): boolean => {
    let result = true;

    if (!email || email.trim() === "") {
      setEmailError("Email is required");
      result = false;
    }

    if (!password || password.trim() === "") {
      setPasswordError("Password is required");
      result = false;
    }

    return result;
  };

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    clearErrors();

    if (!validate()) {
      return;
    }

    const user = { email: email, password };
    const response = await UserService.loginUser(user);

    if (response.status === 200) {
      setStatusMessages([
        {
          message: "Login succesful. Redirecting to homepage...",
          type: "success",
        },
      ]);

      const user = await response.json();
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          token: user.token,
          email: user.email,
          role: user.role,
        })
      );
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } else if (response.status === 401) {
      const { errorMessage } = await response.json();
      setStatusMessages([{ message: errorMessage, type: "error" }]);
    } else {
      setStatusMessages([
        {
          message: "An error has occurred. Please try again later.",
          type: "error",
        },
      ]);
    }
  };

  return (
    <div className="max-w-sm m-auto">
      <div>
        <h3 className="px-0">Login</h3>
      </div>
      {statusMessages && (
        <div className="row">
          <ul className="list-none mb-3 mx-auto ">
            {statusMessages.map(({ message, type }, index) => (
              <li
                key={index}
                className={classNames({
                  " text-red-800": type === "error",
                  "text-green-800": type === "success",
                })}
              >
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <div className="block mb-2 text-sm font-medium">
            <div>
              <label
                htmlFor="emailInput"
                className="block mb-2 text-sm font-medium"
              >
                "Email:"
              </label>
            </div>
            <input
              id="emailInput"
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue:500 block w-full p-2.5"
            />
            {emailError && <div className="text-red-800 ">{emailError}</div>}
          </div>
        </div>
        <div className="mt-2">
          <div>
            <label
              htmlFor="passwordInput"
              className="block mb-2 text-sm font-medium"
            >
              "Password:"
            </label>
          </div>
          <div className="block mb-2 text-sm font-medium">
            <input
              id="passwordInput"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue:500 block w-full p-2.5"
            />
            {passwordError && (
              <div className=" text-red-800">{passwordError}</div>
            )}
          </div>
        </div>

        <div className="row">
          <button type="submit">"Login"</button>
        </div>
      </form>
    </div>
  );
};

export default UserLoginForm;
