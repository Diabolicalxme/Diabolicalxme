import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllSubscribers,
  sendNewsletter,
  deleteSubscriber,
} from "@/store/admin/newsletter-slice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Send } from "lucide-react";
import DeleteConfirmationModal from "@/components/common/delete-confirmation-modal";
import ProductImageUpload from "@/components/admin-view/image-upload";

const AdminNewsLetter = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { subscribers, isLoading, error } = useSelector(
    (state) => state.adminNewsLetter
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [message, setMessage] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    dispatch(getAllSubscribers());
  }, [dispatch]);

  useEffect(() => {
    setImageLoadingStates((prevStates) => {
      return imageFiles?.map((_, index) => prevStates?.[index] || false) || [];
    });
  }, [imageFiles]);

  const toggleSubscriberSelection = (email) => {
    setSelectedEmails((prev) => {
      if (prev.includes(email)) {
        return prev.filter((e) => e !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  const toggleSelectAll = () => {
    const filteredEmails = filteredSubscribers.map((sub) => sub.email);
    const areAllSelected = filteredEmails.every((email) =>
      selectedEmails.includes(email)
    );
    if (areAllSelected) {
      setSelectedEmails(
        selectedEmails.filter((email) => !filteredEmails.includes(email))
      );
    } else {
      const newSelected = [...new Set([...selectedEmails, ...filteredEmails])];
      setSelectedEmails(newSelected);
    }
  };
  const handleDeleteSubscriber = (subscriber) => {
    setSelectedSubscriber(subscriber);
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSubscriber) {
      // Immediately close the modal
      setModalOpen(false);

      // Dispatch the deletion and then update state or handle errors if needed
      dispatch(deleteSubscriber(selectedSubscriber.email))
        .then((data) => {
          if (data?.payload?.success) {
            toast({ title: "Subscriber deleted successfully" });
            dispatch(getAllSubscribers());
            // Remove deleted subscriber from the selection list if present
            setSelectedEmails((prev) =>
              prev.filter((email) => email !== selectedSubscriber.email)
            );
          } else {
            // Optional: if deletion did not succeed, you can opt to reopen the modal
            // setModalOpen(true);
          }
        })
        .catch((error) => {
          console.error("Error deleting subscriber:", error);
          // Optionally reopen the modal if needed upon error
          // setModalOpen(true);
        });
    }
  };


  const handleSendNewsletter = () => {
    if (selectedEmails.length === 0) {
      toast({ title: "Please select at least one subscriber." });
      return;
    }
    setIsSheetOpen(true);
  };
  const confirmSendNewsletter = () => {
    if (selectedEmails.length > 0) {
      const newsletterMessage = message.trim() || "Check out our latest update!";
      setIsSending(true);
      dispatch(
        sendNewsletter({
          emails: selectedEmails,
          message: newsletterMessage,
          flyer: uploadedImageUrls[0] || "",
        })
      )
        .then((data) => {
          setIsSending(false);
          if (data?.payload?.success) {
            toast({ title: "Newsletter sent successfully" });
            setIsSheetOpen(false);
            setUploadedImageUrls([]);
            setImageFiles([]);
            setMessage("");
          }
        })
        .catch((err) => {
          console.error("Error in sending newsletter:", err);
          setIsSending(false);
        });
    }
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const filteredSubscribers = searchQuery
    ? subscribers.filter((sub) =>
      sub?.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : subscribers;
  const isSendDisabled = isSending || !message.trim() || uploadedImageUrls.length === 0;

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div className="flex items-center justify-between">
          <CardTitle>Newsletter Subscribers</CardTitle>
          <Button onClick={handleSendNewsletter}>Send Newsletter</Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search bar to filter subscribers by email */}
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
          <p>Loading subscribers...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : filteredSubscribers && filteredSubscribers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    className="cursor-pointer w-4 h-4"
                    onChange={toggleSelectAll}
                    checked={
                      filteredSubscribers.length > 0 &&
                      filteredSubscribers.every((sub) =>
                        selectedEmails.includes(sub.email)
                      )
                    }
                  />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subscribed On</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber._id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="cursor-pointer w-4 h-4"
                      checked={selectedEmails.includes(subscriber.email)}
                      onChange={() =>
                        toggleSubscriberSelection(subscriber.email)
                      }
                    />
                  </TableCell>
                  <TableCell>{subscriber?.email || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(subscriber?.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteSubscriber(subscriber)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center py-4">No subscribers found.</p>
        )}
      </CardContent>

      {/* Sheet for Sending Newsletter */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>Send Newsletter</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <p>Send a newsletter to the selected subscribers.</p>

            {/* Message Input Field */}
            <div className="mt-4">
              <label htmlFor="message" className="block text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Write your message here..."
              />
            </div>

            {/* Product Image Upload Component */}
            <div className="mt-4">
              <ProductImageUpload
                imageFiles={imageFiles}
                setImageFiles={setImageFiles}
                uploadedImageUrls={uploadedImageUrls}
                setUploadedImageUrls={setUploadedImageUrls}
                imageLoadingState={imageLoadingState}
                imageLoadingStates={imageLoadingStates}
                setImageLoadingStates={setImageLoadingStates}
                setImageLoadingState={setImageLoadingState}
                isSingleImage={false} // Allow multiple images
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="default"
                onClick={confirmSendNewsletter}
                disabled={isSendDisabled}
              >
                <Send className="w-4 h-4 mr-1" />
                {isSending ? "Sending..." : "Send"}
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
        message="Are you sure you want to delete this subscriber?"
      />
    </Card>
  );
};

export default AdminNewsLetter;