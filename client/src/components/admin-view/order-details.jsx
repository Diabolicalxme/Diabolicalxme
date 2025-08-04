import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";

const initialFormData = {
  status: "",
  trackingNumber: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status, trackingNumber } = formData;

    // Validation: If status is "inShipping", tracking number is required
    if (status === "inShipping" && !trackingNumber.trim()) {
      toast({
        title: "Tracking number is required when marking order as shipped",
        variant: "destructive",
      });
      return;
    }

    const updateData = { id: orderDetails?._id, orderStatus: status };
    if (trackingNumber.trim()) {
      updateData.trackingNumber = trackingNumber.trim();
    }

    // Set loading state
    setIsUpdating(true);

    dispatch(updateOrderStatus(updateData)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      } else {
        toast({
          title: data?.payload?.message || "Failed to update order status",
          variant: "destructive",
        });
      }
      // Reset loading state
      setIsUpdating(false);
    }).catch((error) => {
      console.error("Error updating order status:", error);
      toast({
        title: "Failed to update order status",
        variant: "destructive",
      });
      // Reset loading state
      setIsUpdating(false);
    });
  }

  return (
    <DialogContent className="w-full md:w-1/2 bg-playground">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label>{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label> {new Date(orderDetails?.orderDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}</Label>


          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label>₹{orderDetails?.totalAmount}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment method</p>
            <Label>{orderDetails?.paymentMethod}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Label>{orderDetails?.paymentStatus}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 ${orderDetails?.orderStatus === "confirmed"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "rejected"
                      ? "bg-red-600"
                      : "bg-black"
                  }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
          </div>
          {/* Show tracking number if it exists */}
          {orderDetails?.trackingNumber && (
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Tracking Number</p>
              <Label className="bg-blue-50 px-2 py-1 rounded border font-mono text-sm">
                {orderDetails.trackingNumber}
              </Label>
            </div>
          )}
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Order Details</div>
            <ul className="grid gap-3">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                ? orderDetails?.cartItems.map((item) => (
                  <li className="flex items-center justify-between">
                    <span>Title: {item.title}</span>
                    {item?.colors?.title && <span>Color: {item?.colors?.title}</span>}
                    <span>Quantity: {item.quantity}</span>
                    <span>Price: ₹{item.price}</span>
                  </li>
                ))
                : null}
            </ul>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Shipping Info</div>
            <div className="grid gap-0.5 text-muted-foreground">
              <span>{orderDetails?.user?.name}</span>
              <span>{orderDetails?.user?.email}</span>
              <span>{orderDetails?.addressInfo?.address}</span>
              <span>{orderDetails?.addressInfo?.city}</span>
              <span>{orderDetails?.addressInfo?.pincode}</span>
              <span>{orderDetails?.addressInfo?.phone}</span>
              <span>{orderDetails?.addressInfo?.notes}</span>
            </div>
          </div>
        </div>

        <div>
          <CommonForm
            formControls={[
              {
                label: "Order Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "inProcess", label: "In Process" },
                  { id: "inShipping", label: "In Shipping" },
                  { id: "delivered", label: "Delivered" },
                  { id: "rejected", label: "Rejected" },
                ],
              },
              // Show tracking number field only when status is "inShipping"
              ...(formData.status === "inShipping" ? [{
                label: "Tracking Number",
                name: "trackingNumber",
                componentType: "input",
                type: "text",
                placeholder: "Enter tracking number (e.g., TRK123456789)",
              }] : []),
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={
              isUpdating
                ? (formData.status === "inShipping" && formData.trackingNumber
                    ? "Updating & Sending Email..."
                    : "Updating...")
                : (formData.status === "inShipping" && formData.trackingNumber
                    ? "Update Status & Send Tracking Email"
                    : "Update Order Status")
            }
            onSubmit={handleUpdateStatus}
            isBtnDisabled={isUpdating}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
