import Header from "@components/header";
import UsersOverviewTable from "@components/users/UsersOverviewTable";
import UserService from "@services/UserService";
import { Loader } from "lucide-react";
import Head from "next/head";
import router from "next/router";
import { useEffect, useState } from "react";
import { User } from "types";
import { toast } from "react-hot-toast";

const Users: React.FC = () => {
  const [users, setUsers] = useState<Array<User>>();
  const [error, setError] = useState<string>();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const userString = sessionStorage.getItem("loggedInUser");
    if (userString) setLoggedInUser(JSON.parse(userString));
    setAuthLoading(false);
  }, []);

  const getAllUsers = async () => {
    try {
      const response = await UserService.getAllUsers();
      if (!response.ok) throw new Error("Failed to fetch users");
      const users = await response.json();
      setUsers(users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to fetch users");
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    getAllUsers();
    setIsLoading(false);
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-700" />
          <p className="text-gray-600 text-lg">Loading</p>
        </div>
      </div>
    );
  }

  if (!loggedInUser || loggedInUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 border-t-4 border-t-purple-700 text-center">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 mb-2">
            You do not have permission to view this page.
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer px-4 py-2 rounded-md transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Users</h1>
        </div>

        {error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        ) : !users || users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-lg text-gray-500">No users found</p>
          </div>
        ) : (
          <UsersOverviewTable users={users} onUserDeleted={getAllUsers} />
        )}
      </div>
    </div>
  );
};

export default Users;
