import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CommonForm from "../common/form";
import { addressFormControls } from "@/config";
import { addNewAddress, deleteAddress, editaAddress, fetchAllAddresses } from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { useToast } from "../ui/use-toast";
import DeleteConfirmationModal from "@/components/common/delete-confirmation-modal";
import { MapPin, Plus } from "lucide-react";
import { getStatesList, searchCitiesByState, getStateNameByCode, getStateCodeByName } from "@/utils/locationUtils";
import { getThemeColors } from "@/utils/theme-utils";

// Initial form data constant
const initialAddressFormData = {
  name: "",
  address: "",
  state: "",
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
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [currentStateForCities, setCurrentStateForCities] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);
  const { currentTheme } = useSelector((state) => state.theme);
  const { toast } = useToast();

  // Get theme-aware colors
  const themeColors = getThemeColors(currentTheme);

  // Load states on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        setIsLoadingStates(true);
        const states = await getStatesList();
        setAvailableStates(states);
      } catch (error) {
        toast({
          title: "Error loading states",
          description: "Please refresh the page to try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingStates(false);
      }
    };

    loadStates();
  }, [toast]);

  // Helper function to load cities for a state
  const loadCitiesForState = async (stateCode) => {
    // Skip loading if cities are already loaded for this state
    if (currentStateForCities === stateCode && availableCities.length > 0) {
      return;
    }

    try {
      setIsLoadingCities(true);
      setAvailableCities([]); // Clear previous cities
      setCurrentStateForCities(stateCode);

      // Get all cities for the state by searching with common prefixes
      const commonPrefixes = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
      const allCities = [];

      // Search with multiple prefixes to get comprehensive city list
      for (const prefix of commonPrefixes.slice(0, 5)) { // Limit to first 5 to avoid too many API calls
        try {
          const cities = await searchCitiesByState(prefix, stateCode);
          cities.forEach(city => {
            if (!allCities.find(c => c.value === city.value)) {
              allCities.push(city);
            }
          });
        } catch (error) {
          // Continue with other prefixes if one fails
        }
      }

      // Sort cities alphabetically
      allCities.sort((a, b) => a.label.localeCompare(b.label));
      setAvailableCities(allCities);
    } catch (error) {
      toast({
        title: "Error loading cities",
        description: "Please try again or enter city manually.",
        variant: "destructive",
      });
      setAvailableCities([]);
      setCurrentStateForCities(null);
    } finally {
      setIsLoadingCities(false);
    }
  };

  // Handle state change and load cities
  const handleStateChange = async (selectedStateCode) => {
    setFormData(prev => ({
      ...prev,
      state: selectedStateCode,
      city: "" // Reset city when state changes
    }));

    // Load cities for the selected state
    if (selectedStateCode) {
      loadCitiesForState(selectedStateCode);
    } else {
      setAvailableCities([]);
      setCurrentStateForCities(null);
    }
  };

  // Validate form fields
  const validateField = (name, value) => {
    const control = addressFormControls.find(ctrl => ctrl.name === name);
    if (!control?.validation) return "";

    const { required, pattern, patternMessage, minLength, maxLength } = control.validation;

    if (required && (!value || value.trim() === "")) {
      return `${control.label} is required`;
    }

    if (pattern && value && !pattern.test(value)) {
      return patternMessage || `Invalid ${control.label.toLowerCase()}`;
    }

    if (minLength && value && value.length < minLength) {
      return `${control.label} must be at least ${minLength} characters`;
    }

    if (maxLength && value && value.length > maxLength) {
      return `${control.label} must not exceed ${maxLength} characters`;
    }

    return "";
  };

  // Validate entire form
  const validateForm = () => {
    const errors = {};
    addressFormControls.forEach(control => {
      const error = validateField(control.name, formData[control.name]);
      if (error) errors[control.name] = error;
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form data change with validation
  const handleFormDataChange = (name, value) => {
    if (name === "state") {
      handleStateChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle address addition or update
  function handleManageAddress(event) {
    event.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

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
if (typeof setCurrentSelectedAddress === 'function') {
  setCurrentSelectedAddress(null);
}

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

  async function handleEditAddress(getCurrentAddress) {
    setCurrentEditedId(getCurrentAddress?._id);

    // Handle state - if it's a name, convert to code; if it's already a code, use as is
    const stateValue = getCurrentAddress?.state || "";
    let stateCode = stateValue;

    // Check if the state value is a name (longer than 3 chars) and convert to code
    if (stateValue && stateValue.length > 3) {
      try {
        const result = getStateCodeByName(stateValue);
        // Handle both synchronous and asynchronous returns
        stateCode = (typeof result === 'string') ? result : await result;
        stateCode = stateCode || stateValue;
      } catch (error) {
        stateCode = stateValue;
      }
    }

    // Set form data first
    setFormData({
      ...formData,
      name: getCurrentAddress?.name || "",
      address: getCurrentAddress?.address || "",
      state: stateCode,
      city: getCurrentAddress?.city || "",
      phone: getCurrentAddress?.phone || "",
      pincode: getCurrentAddress?.pincode || "",
      notes: getCurrentAddress?.notes || "",
    });

    // Load cities for the selected state when editing
    if (stateCode) {
      loadCitiesForState(stateCode);
    }

    setShowForm(true);
  }

  function isFormValid() {
    const requiredFields = ['name', 'address', 'state', 'city', 'phone', 'pincode'];
    return requiredFields.every(field => {
      const value = formData[field];
      return value && typeof value === 'string' && value.trim() !== '';
    });
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAllAddresses(user?.id));
    }
  }, [dispatch, user]);

  // Update cities when state changes in form data
  // Note: City search is now handled via searchCitiesByState when user types in city field
  // We don't pre-populate cities anymore to reduce API calls

  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-light uppercase tracking-wide mb-2 ${themeColors.cardText}`}>Your Addresses</h2>
            <div className={`w-12 h-0.5 ${themeColors.dividerBg}`}></div>
          </div>
          {!showForm && addressList.length < 3 && (
            <button
              onClick={() => {
                setCurrentEditedId(null);
                setFormData(initialAddressFormData);
                setFormErrors({});
                setShowForm(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 border-2 transition-colors duration-300 text-sm font-medium ${themeColors.buttonOutline}`}
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
          <div className={`text-center py-12 border rounded-md mb-8 ${themeColors.formBg} ${themeColors.borderColor}`}>
            <div className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full ${themeColors.hoverBg}`}>
              <MapPin className={`h-8 w-8 ${themeColors.mutedText}`} />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${themeColors.cardText}`}>No Addresses Found</h3>
            <p className={`mb-6 ${themeColors.mutedText}`}>You haven't added any addresses yet.</p>
            {!showForm && (
              <button
                onClick={() => {
                  setCurrentEditedId(null);
                  setFormData(initialAddressFormData);
                  setFormErrors({});
                  setShowForm(true);
                }}
                className={`inline-block px-6 py-3 border-2 transition-colors duration-300 uppercase tracking-wider text-sm font-medium ${themeColors.buttonOutline}`}
              >
                Add Your First Address
              </button>
            )}
          </div>
        )}

        {showForm && (
          <div className={`border rounded-md p-6 ${themeColors.borderColor} ${themeColors.cardBg}`}>
            <div className="mb-6">
              <h3 className={`text-xl font-light uppercase tracking-wide mb-2 ${themeColors.cardText}`}>
                {currentEditedId !== null ? "Edit Address" : "Add New Address"}
              </h3>
              <div className={`w-12 h-0.5 mb-6 ${themeColors.dividerBg}`}></div>
            </div>

            <CommonForm
              formControls={addressFormControls}
              formData={formData}
              setFormData={handleFormDataChange}
              buttonText={currentEditedId !== null ? "Update Address" : "Save Address"}
              onSubmit={handleManageAddress}
              isBtnDisabled={!isFormValid()}
              buttonClassName={`px-6 py-3 border-2 transition-colors duration-300 uppercase tracking-wider text-sm font-medium ${themeColors.buttonOutline}`}
              stateOptions={availableStates}
              cityOptions={availableCities}
              isLoadingStates={isLoadingStates}
              isLoadingCities={isLoadingCities}
              formErrors={formErrors}
            />

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowForm(false);
                  setCurrentEditedId(null);
                  setFormData(initialAddressFormData);
                  setFormErrors({});
                }}
                className={`text-sm transition-colors ${themeColors.mutedText} hover:${themeColors.cardText.replace('text-', 'text-')}`}
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