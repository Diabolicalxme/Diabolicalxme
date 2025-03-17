import { useSelector } from "react-redux";
import { DialogContent, DialogTitle } from "../ui/dialog";
import { Package, MapPin, CreditCard, Calendar, Tag, CheckCircle } from "lucide-react";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  // Format date in a more readable way
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric"
    };
    return new Date(dateString.split("T")[0]).toLocaleDateString("en-US", options);
  };

  // Get status color class
  const getStatusClass = (status) => {
    switch(status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "delivered":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-white">
      <div className="mt-4 overflow-y-auto pr-1 -mr-1 max-h-[calc(90vh-80px)]">
        <DialogTitle className="text-xl font-light uppercase tracking-wide text-center sticky top-0 bg-white pb-4 z-10">
          Order Details
        </DialogTitle>
        <div className="w-16 h-0.5 bg-black mx-auto mb-6"></div>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-md border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h3 className="text-sm uppercase tracking-wide font-medium">Order Summary</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(orderDetails?.orderStatus)}`}>
                {orderDetails?.orderStatus?.charAt(0).toUpperCase() + orderDetails?.orderStatus?.slice(1) || "Processing"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 overflow-hidden">
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-sm font-medium truncate">{orderDetails?._id}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Order Date</p>
                  <p className="text-sm font-medium">{formatDate(orderDetails?.orderDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="text-sm font-medium capitalize">{orderDetails?.paymentMethod}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Payment Status</p>
                  <p className="text-sm font-medium capitalize">{orderDetails?.paymentStatus}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-sm uppercase tracking-wide font-medium mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 flex-shrink-0" />
              <span>Order Items</span>
            </h3>

            <div className="border border-gray-200 rounded-md overflow-hidden">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {orderDetails.cartItems.map((item, index) => (
                    <div key={index} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.title}</h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                          {item?.colors?.title && <span>Color: {item?.colors?.title}</span>}
                          <span>Quantity: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-sm font-medium mt-1 sm:mt-0">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">No items found</div>
              )}

              <div className="bg-gray-50 p-3 sm:p-4 flex justify-between items-center border-t border-gray-200">
                <span className="text-sm font-medium">Total Amount</span>
                <span className="text-base font-medium">{formatCurrency(orderDetails?.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="pb-4">
            <h3 className="text-sm uppercase tracking-wide font-medium mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>Shipping Information</span>
            </h3>

            <div className="border border-gray-200 rounded-md p-3 sm:p-4">
              <p className="font-medium text-sm mb-2">{user?.userName}</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="break-words">{orderDetails?.addressInfo?.address}</p>
                <p>{orderDetails?.addressInfo?.city} - {orderDetails?.addressInfo?.pincode}</p>
                <p>Phone: {orderDetails?.addressInfo?.phone}</p>
                {orderDetails?.addressInfo?.notes && (
                  <p className="mt-2 text-gray-500 italic break-words">{orderDetails?.addressInfo?.notes}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
