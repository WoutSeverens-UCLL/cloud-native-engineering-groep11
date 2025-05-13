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
    <div>
      <div>
        <h1>Login</h1>
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
          <div>
            <div>
              <label
                htmlFor="emailInput"
              >
                Email:
              </label>
            </div>
            <input
              id="emailInput"
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {emailError && <div>{emailError}</div>}
          </div>
        </div>
        <div>
          <div>
            <label
              htmlFor="passwordInput"
            >
              Password:
            </label>
          </div>
          <div>
            <input
              id="passwordInput"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {passwordError && (
              <div>{passwordError}</div>
            )}
          </div>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
};

export default UserLoginForm;
