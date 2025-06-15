import { Button } from "@components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import UserService from "@services/UserService";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { User } from "types";

interface Props {
  users: User[];
  onUserDeleted: () => void;
}

const UsersOverviewTable: React.FC<Props> = ({ users, onUserDeleted }) => {
  const router = useRouter();

  const handleDeleteUser = async (email: string | undefined) => {
    if (!email) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmed) return;

    try {
      console.log("Attempting to delete user with email:", email);
      console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
      console.log("Function Key:", process.env.FK_USERS_DELETE);

      const response = await UserService.deleteUser(email);
      console.log("Delete response:", response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Delete error response:", errorData);
        throw new Error(errorData.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      onUserDeleted();
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const handleEditUser = (email: string | undefined) => {
    if (!email) return;
    router.push(`/users/edit/${email}`);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b-gray-200">
            <TableHead className="text-gray-500 font-semibold">
              First Name
            </TableHead>
            <TableHead className="text-gray-500 font-semibold">
              Last Name
            </TableHead>
            <TableHead className="text-gray-500 font-semibold">Email</TableHead>
            <TableHead className="text-gray-500 font-semibold">Role</TableHead>
            <TableHead className="text-right text-gray-500 font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.email}
              className="border-b-gray-200 hover:bg-gray-100"
            >
              <TableCell className="font-semibold">{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span className="px-3 py-1 bg-gray-100 text-sm font-semibold rounded-full text-gray-800">
                  {user.role}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-500 border-gray-300 hover:border-gray-600 cursor-pointer"
                    onClick={() => handleEditUser(user.email)}
                  >
                    <Edit className="h-4 w-4 text-black" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-gray-300 hover:border-red-600 cursor-pointer"
                    onClick={() => handleDeleteUser(user.email)}
                  >
                    <Trash className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersOverviewTable;
