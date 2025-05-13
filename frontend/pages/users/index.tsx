import Header from "@components/header";
import UsersOverviewTable from "@components/users/UsersOverviewTable";
import UserService from "@services/UserService";
import Head from "next/head";
import { useEffect, useState } from "react";
import { User } from "types";

const Users: React.FC = () => {
    const [users, setUsers] = useState<Array<User>>();
    const [error, setError] = useState<string>();

    const getAllUsers = async () => {
        setError('');
        const response = await UserService.getAllUsers();

    if (!response.ok) {
        if (response.status === 401) {
            setError(
                'You are not authorized to view this page. Please login first.'
            );
        } else {
            setError(response.statusText);
        }
    } else {
        const users = await response.json();
        setUsers(users);
    }
  };

    useEffect(() => {
        getAllUsers();
    }, [])

    return (
        <>
            <Head>
                <title>Users</title>
            </Head>
            <Header />
            <main>
                <h1>Users</h1>
                <section>
                    {error? <main className="alert alert-info">{error}</main>
                    : users && (
                        <UsersOverviewTable
                            users={users}
                        />
                    )}
                </section>
            </main>
        </>
    );
};

export default Users;