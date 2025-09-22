import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {Trash2} from "lucide-react";
import { getAllContacts, deleteContact } from "../../store/admin/contact-slice";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import DeleteConfirmationModal from "@/components/common/delete-confirmation-modal";

const AdminContact = () => {
  const dispatch = useDispatch();

  // Access adminContact state from Redux store
  const { contactList, isLoading, error } = useSelector((state) => state.adminContact);

  // Local state for delete confirmation modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);

  // Local state for search query
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getAllContacts());
  }, [dispatch]);

  // Open modal to confirm deletion
  const handleDeleteClick = (id) => {
    setSelectedContactId(id);
    setModalOpen(true);
  };

  // Confirm deletion of a contact
  const confirmDelete = () => {
    dispatch(deleteContact(selectedContactId));
    setModalOpen(false);
  };

  // Handler for search input change filtering by email
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter contacts based on search query (by email)
  const filteredContacts = searchQuery
    ? contactList.filter((contact) =>
        contact.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contactList;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Contacts</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search bar to filter contacts by email */}
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
          <p>Loading contacts...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : filteredContacts && filteredContacts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact._id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.message}</TableCell>
                  <TableCell>
                    {new Date(contact.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteClick(contact._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center py-4">No contacts found.</p>
        )}
      </CardContent>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this contact?"
      />
    </Card>
  );
};

export default AdminContact;