import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CommonForm from "../common/form";
import { addressFormControls } from "@/config";
import { addNewAddress, deleteAddress, editaAddress, fetchAllAddresses } from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { useToast } from "../ui/use-toast";
import DeleteConfirmationModal from "@/components/common/delete-confirmation-modal";
import { MapPin, Plus } from "lucide-react";

// Initial form data constant
const initialAddressFormData = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: ""
};

function Address({ setCurrentSelectedAddress, selectedId }) {
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);
  const { toast } = useToast();

  // Handle address addition or update
  function handleManageAddress(event) {
    event.preventDefault();

    if (addressList.length >= 3 && currentEditedId === null) {
      setFormData(initialAddressFormData);
      toast({
        title: "You can add max 3 addresses",
        variant: "destructive",
      });
      return;
    }

    if (currentEditedId !== null) {
      dispatch(
        editaAddress({
          userId: user?.id,
          addressId: currentEditedId,
          formData,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllAddresses(user?.id));
          setCurrentSelectedAddress(null);
          setCurrentEditedId(null);
          setFormData(initialAddressFormData);
          setShowForm(false);
          toast({
            title: "Address updated successfully",
          });
        }
      });
    } else {
      dispatch(
        addNewAddress({
          ...formData,
          userId: user?.id,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllAddresses(user?.id));
          setFormData(initialAddressFormData);
          setShowForm(false);
          toast({
            title: "Address added successfully",
          });
        }
      });
    }
  }

  function handleDeleteAddress(getCurrentAddress) {
    setAddressToDelete(getCurrentAddress);
    setModalOpen(true);
  }

  // Confirm deletion once modal is confirmed
  function confirmDelete() {
    if (addressToDelete) {
      dispatch(
        deleteAddress({ userId: user?.id, addressId: addressToDelete._id })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllAddresses(user?.id));
          toast({
            title: "Address deleted successfully",
          });
        }
      });
    }
    setModalOpen(false);
    setAddressToDelete(null);
  }

  function handleEditAddress(getCurrentAddress) {
    setCurrentEditedId(getCurrentAddress?._id);
    setFormData({
      ...formData,
      address: getCurrentAddress?.address,
      city: getCurrentAddress?.city,
      phone: getCurrentAddress?.phone,
      pincode: getCurrentAddress?.pincode,
      notes: getCurrentAddress?.notes,
    });
    setShowForm(true);
  }

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key].trim() !== "")
      .every((item) => item);
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAllAddresses(user?.id));
    }
  }, [dispatch, user]);

  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-light uppercase tracking-wide mb-2">Your Addresses</h2>
            <div className="w-12 h-0.5 bg-black"></div>
          </div>
          {!showForm && addressList.length < 3 && (
            <button
              onClick={() => {
                setCurrentEditedId(null);
                setFormData(initialAddressFormData);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Address</span>
            </button>
          )}
        </div>

        {addressList && addressList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {addressList.map((singleAddressItem) => (
              <AddressCard
                key={singleAddressItem._id}
                selectedId={selectedId}
                handleDeleteAddress={handleDeleteAddress}
                addressInfo={singleAddressItem}
                handleEditAddress={handleEditAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-md mb-8">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Addresses Found</h3>
            <p className="text-gray-500 mb-6">You haven't added any addresses yet.</p>
            {!showForm && (
              <button
                onClick={() => {
                  setCurrentEditedId(null);
                  setFormData(initialAddressFormData);
                  setShowForm(true);
                }}
                className="inline-block px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
              >
                Add Your First Address
              </button>
            )}
          </div>
        )}

        {showForm && (
          <div className="border border-gray-200 rounded-md p-6 bg-white">
            <div className="mb-6">
              <h3 className="text-xl font-light uppercase tracking-wide mb-2">
                {currentEditedId !== null ? "Edit Address" : "Add New Address"}
              </h3>
              <div className="w-12 h-0.5 bg-black mb-6"></div>
            </div>

            <CommonForm
              formControls={addressFormControls}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Update Address" : "Save Address"}
              onSubmit={handleManageAddress}
              isBtnDisabled={!isFormValid()}
              buttonClassName="px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
            />

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowForm(false);
                  setCurrentEditedId(null);
                  setFormData(initialAddressFormData);
                }}
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this address?"
      />
    </>
  );
}


export default Address;