import { User } from "@/types";

type Props = {
    users: Array<User>;
};

const UsersOverviewTable: React.FC<Props> = ({users}: Props) => {
    return (
        <>
        {users && (
            <table className = "table table-hover">
                <thead>
                    <tr>
                        <th scope="col"> Email</th>
                        <th scope="col"> First Name</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr
                            key={index}
                        >
                            <td>{user.email}</td>
                            <td>{user.firstName}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
        </>
    )
}

export default UsersOverviewTable;