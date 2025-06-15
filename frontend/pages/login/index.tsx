import UserLoginForm from "@components/users/UserLoginForm";
import Header from "@components/header";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import router from "next/router";

const Login = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const userString = sessionStorage.getItem("loggedInUser");
    if (userString) setLoggedInUser(JSON.parse(userString));
  }, []);

    if (loggedInUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md border-t-4 border-t-purple-700 p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
              <svg
                className="h-6 w-6 text-purple-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">
            Already Logged In
          </h3>
          <p className="text-gray-600">
            Redirect to homepage...
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer px-4 py-2 rounded-md transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <UserLoginForm />
      </main>
    </div>
  );
};

export default Login;
