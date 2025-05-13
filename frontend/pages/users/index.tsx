import Header from "@components/header";
import UsersOverviewTable from "@components/users/UsersOverviewTable";
import UserService from "@services/UserService";
import Head from "next/head";
import { useEffect, useState } from "react";
import { User } from "types";

const Books: React.FC = () => {
    const [users, setUsers] = useState<Array<User>>();
    const [error, setError] = useState<string>();

    const getAllUsers = async () => {
        const response = await UserService.getAllUsers();
        const users = await response.json();
        setUsers(users);
        setError(users.message);
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

export default Books;