import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BannerTile from "@/components/admin-view/banner-tile";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import CommonForm from "@/components/common/form";
import ProductImageUpload from "@/components/admin-view/image-upload";
import { addBannerFormElements } from "@/config";
import {
  addNewBanner,
  editBanner,
  deleteBanner,
  fetchAllBanners,
} from "@/store/admin/banners-slice";

const initialFormData = {
  image: null,
  description: "",
};

function AdminBanners() {
  const [openCreateBannersDialog, setOpenCreateBannersDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFiles, setImageFiles] = useState([]);

  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);

  const [imageLoadingStates, setImageLoadingStates] = useState([]);

  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const { bannerList, isLoading } = useSelector((state) => state.adminBanners);

  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleEditBanner(banner) {
    setFormData({
      description: banner.description,
    });
    setUploadedImageUrls([banner.image]);
    setCurrentEditedId(banner._id);
    setOpenCreateBannersDialog(true);
  }

  function onSubmit(event) {
    event.preventDefault();

    if (currentEditedId !== null) {
      dispatch(
        editBanner({
          id: currentEditedId,
          formData: {
            ...formData,
            image: uploadedImageUrls[0],
          },
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllBanners());
          resetForm();
        }
      });
    } else {
      dispatch(
        addNewBanner({
          ...formData,
          image: uploadedImageUrls[0],
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllBanners());
          resetForm();
          toast({
            title: "Banner added successfully",
          });
        }
      });
    }
  }

  function resetForm() {
    setFormData(initialFormData);
    setUploadedImageUrls("");
    setImageFiles(null);
    setCurrentEditedId(null);
    setOpenCreateBannersDialog(false);
  }

  function handleDelete(bannerId) {
    dispatch(deleteBanner(bannerId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllBanners());
      }
    });
  }

  function isFormValid() {
    //check if the image is still uploading
    if (imageLoadingStates?.includes(true)) return false;
    return formData.description !== "";
  }

  useEffect(() => {
    dispatch(fetchAllBanners());
  }, [dispatch]);

  useEffect(() => {
    // Sync the loading states array size with the image files
    setImageLoadingStates((prevStates) =>
      imageFiles?.map((_, index) => prevStates[index] || false)
    );
  }, [imageFiles]);

  return (
    <Fragment>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">All Banners</h1>
        <Button className="bg-primary hover:bg-accent" onClick={() => setOpenCreateBannersDialog(true)}>
          Add New Banner
        </Button>
      </div>

      {isLoading ? (
      <div className="flex items-center justify-center w-full mt-16 mb-1">
      
        <span className="text-lg whitespace-nowrap px-2">Loading banners...</span>
       
      </div>
    ) : (
      <div className="flex flex-col gap-5">
        {bannerList && bannerList.length > 0
          ? bannerList.map((bannerItem) => (
            <BannerTile
              key={bannerItem._id}
              image={bannerItem.image}
              description={bannerItem.description}
              handleEdit={() => handleEditBanner(bannerItem)}
              handleDelete={() => handleDelete(bannerItem._id)}
            />
          ))
          : null}
      </div>
      )}

      <Sheet
        open={openCreateBannersDialog}
        onOpenChange={() => {
          setOpenCreateBannersDialog(false);
          resetForm();
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Banner" : "Add New Banner"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            uploadedImageUrls={uploadedImageUrls}
            setUploadedImageUrls={setUploadedImageUrls}
            setImageLoadingState={setImageLoadingState}
            setImageLoadingStates={setImageLoadingStates}
            imageLoadingState={imageLoadingState}
            imageLoadingStates={imageLoadingStates}
            isSingleImage={true}
            isEditMode={currentEditedId !== null || currentEditedId === null}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={addBannerFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminBanners;
