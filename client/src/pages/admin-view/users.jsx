import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllUsers, updateUser, deleteUser } from "../../store/admin/users-slice";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Edit } from "lucide-react";
import DeleteConfirmationModal from "@/components/common/delete-confirmation-modal";

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Redux state for users
  const { usersList, isLoading, error } = useSelector((state) => state.adminUsers);

  // State for managing edit sheet
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  // State for delete confirmation modal
  const [isModalOpen, setModalOpen] = useState(false);

  // State for searching by email
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Handle delete confirmation
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      dispatch(deleteUser(selectedUser._id)).then((data) => {
        if (data?.payload?.success) {
          toast({ title: "User deleted successfully" });
          setModalOpen(false);
          dispatch(getAllUsers());
        }
      });
    }
  };

  // Handle role update
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsSheetOpen(true);
  };

  const confirmUpdate = () => {
    if (selectedUser && newRole) {
      dispatch(updateUser({ id: selectedUser._id, role: newRole })).then((data) => {
        if (data?.payload?.success) {
          toast({ title: "User role updated successfully" });
          setIsSheetOpen(false);
          dispatch(getAllUsers());
        }
      });
    }
  };

  // Handler for search input change filtering by email
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter usersList based on search query using email
  const filteredUsers = searchQuery
    ? usersList.filter((user) =>
        user?.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : usersList;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search bar to filter users by email */}
        <div className="mb-4 w-1/3">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full border rounded-md p-2"
          />
        </div>
        {isLoading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : filteredUsers && filteredUsers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user?.userName || "N/A"}</TableCell>
                  <TableCell>{user?.email || "N/A"}</TableCell>
                  <TableCell>{user?.role || "N/A"}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" onClick={() => handleEditUser(user)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteUser(user)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center py-4">No users found.</p>
        )}
      </CardContent>

      {/* Sheet for Editing User Role */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>Edit User Role</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <p>
              Update the role for <strong>{selectedUser?.userName}</strong>.
            </p>
            <div className="mt-4">
              <label htmlFor="role" className="block text-sm font-medium">
                New Role
              </label>
              <select
                id="role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" onClick={confirmUpdate}>
                Update Role
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this user?"
      />
    </Card>
  );
};

export default AdminUsers;