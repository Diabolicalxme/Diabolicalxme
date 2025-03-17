import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllFeedback, deleteFeedback } from "../../store/admin/feedback-slice";
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
import { Trash2 } from "lucide-react";
import DeleteConfirmationModal from "@/components/common/delete-confirmation-modal";

const AdminFeedback = () => {
  const dispatch = useDispatch();

  // Redux state
  const { feedbackList, isLoading, error } = useSelector((state) => state.adminFeedback);

  // State for delete confirmation modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);

  // State for searching feedback by email
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getAllFeedback());
  }, [dispatch]);

  // Open delete confirmation modal
  const handleDeleteClick = (id) => {
    setSelectedFeedbackId(id);
    setModalOpen(true);
  };

  // Confirm delete action
  const confirmDelete = () => {
    dispatch(deleteFeedback(selectedFeedbackId));
    setModalOpen(false);
  };

  // Handler for search input change filtering by email
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter feedback based on search query (by email)
  const filteredFeedbackList = searchQuery
    ? feedbackList.filter((feedback) =>
        feedback?.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : feedbackList;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search bar to filter feedback by email */}
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
          <p>Loading feedback...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : filteredFeedbackList && filteredFeedbackList.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbackList.map((feedback) => (
                <TableRow key={feedback._id}>
                  <TableCell>{feedback?.user || "N/A"}</TableCell>
                  <TableCell>{feedback?.email || "N/A"}</TableCell>
                  <TableCell>{feedback?.feedback}</TableCell>
                  <TableCell>
                    {new Date(feedback.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteClick(feedback._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center py-4">No feedback found.</p>
        )}
      </CardContent>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this feedback?"
      />
    </Card>
  );
};

export default AdminFeedback;