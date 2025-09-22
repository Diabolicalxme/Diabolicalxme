import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InstafeedTile from "@/components/admin-view/instafeed-tile";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import  CommonForm  from "@/components/common/form";
import DeleteConfirmationModal from "@/components/common/delete-confirmation-modal";
import { addInstafeedFormElements } from "@/config";
import {
  addNewInstaFeedPost,
  deleteInstaFeedPost,
  fetchAllInstaFeedPosts,
} from "@/store/admin/instafeed-slice";

const initialFormData = {
  postUrl: "",
};

function AdminInstafeed() {
  const [openCreatePostDialog, setOpenCreatePostDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  // State for delete confirmation modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const { instaFeedPosts, isLoading } = useSelector((state) => state.adminInstaFeed);

  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    const payload = {
      posts: [formData.postUrl], // Wrap the postUrl in an array under the `posts` key
    };

    dispatch(addNewInstaFeedPost(payload)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllInstaFeedPosts());
        resetForm();
        toast({
          title: "Post added successfully",
        });
      }
    });
  }

  function resetForm() {
    setFormData(initialFormData);
    setCurrentEditedId(null);
    setOpenCreatePostDialog(false);
  }

  function isFormValid() {
    return formData.postUrl.trim() !== "";
  }

  // Open delete confirmation modal
  function handleDeleteClick(postId) {
    setSelectedPostId(postId);
    setModalOpen(true);
  }

  // Confirm delete action
  function confirmDelete() {
    if (selectedPostId) {
      dispatch(deleteInstaFeedPost(selectedPostId)).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllInstaFeedPosts());
          toast({
            title: "Post deleted successfully",
          });
        }
      });
      setModalOpen(false);
    }
  }

  useEffect(() => {
    dispatch(fetchAllInstaFeedPosts());
  }, [dispatch]);

  return (
    <Fragment>
      
      <div className="mb-5 w-full flex justify-between">
      <h1 className="mb-4 text-2xl font-semibold leading-none tracking-tight">All Posts</h1>
        <Button
          className="bg-primary hover:bg-accent"
          onClick={() => setOpenCreatePostDialog(true)}
        >
          Add New Post
        </Button>
      </div>
      
      {isLoading ? (
      <div className="flex items-center justify-center w-full mt-16 mb-1">
      
        <span className="text-lg whitespace-nowrap px-2">Loading posts...</span>
       
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {instaFeedPosts &&
        instaFeedPosts.posts &&
        instaFeedPosts.posts.length > 0
          ? instaFeedPosts.posts.map((postUrl, index) => (
              <InstafeedTile
                key={index}
                postUrl={postUrl}
                handleDelete={() => handleDeleteClick(postUrl)}
              />
            ))
          : null}
      </div>
      )}

      <Sheet
        open={openCreatePostDialog}
        onOpenChange={() => {
          setOpenCreatePostDialog(false);
          resetForm();
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Post" : "Add New Post"}
            </SheetTitle>
          </SheetHeader>
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={addInstafeedFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this post?"
      />
    </Fragment>
  );
}

export default AdminInstafeed;
