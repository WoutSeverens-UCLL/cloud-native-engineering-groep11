import Header from "@components/header";
import UsersOverviewTable from "@components/users/UsersOverviewTable";
import UserService from "@services/UserService";
import Head from "next/head";
import { useEffect, useState } from "react";
import { User } from "types";

const Users: React.FC = () => {
  const [users, setUsers] = useState<Array<User>>();
  const [error, setError] = useState<string>();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString !== null) {
      setLoggedInUser(JSON.parse(loggedInUserString));
    }
  }, []);

  const getAllUsers = async () => {
    const response = await UserService.getAllUsers();
    const users = await response.json();
    setUsers(users);
    setError(users.message);
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  if (!loggedInUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center text-red-600 py-12">
            You must be logged in to view users!
          </div>
        </div>
      </div>
    );
  }

  if (loggedInUser && loggedInUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center text-red-600 py-12">
            You do not have permission to view users!
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Users</title>
      </Head>
      <Header />
      <main>
        <h1>Users</h1>
        <section>
          {error ? (
            <main className="alert alert-info">{error}</main>
          ) : (
            users && <UsersOverviewTable users={users} />
          )}
        </section>
      </main>
    </>
  );
};

export default Users;
