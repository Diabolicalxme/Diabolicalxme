import { useSelector } from "react-redux";
import { DialogContent, DialogTitle } from "../ui/dialog";
import { Package, MapPin, CreditCard, Calendar, Tag, CheckCircle, Copy, Check } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useState } from "react";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Copy order ID to clipboard
  const copyOrderId = async (orderId) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedOrderId(true);
      toast({
        title: "Order ID copied!",
        description: "Order ID has been copied to clipboard.",
      });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedOrderId(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy order ID to clipboard.",
        variant: "destructive",
      });
    }
  };

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

  // Function to format address with proper line breaks
  const formatAddress = (address) => {
    if (!address) return 'N/A';

    // If address contains commas, split and format each part on new line
    if (address.includes(',')) {
      return address.split(',').map((part, index) => (
        <span key={index} className="block">
          {part.trim()}
        </span>
      ));
    }

    // If no commas, return as is
    return address;
  };

  return (
    <DialogContent className="w-full md:w-[800px] max-h-[90vh] bg-white">
      <div className="mt-4 overflow-y-auto pr-1 -mr-1 max-h-[calc(90vh-80px)]">
        <div className="sticky top-0 bg-white pt-2 pb-4 z-[5] border-b border-gray-100 mr-8">
          <DialogTitle className="text-xl font-light uppercase tracking-wide text-center">
            Order Details
          </DialogTitle>
          <div className="w-16 h-0.5 bg-black mx-auto mt-2"></div>
        </div>

        <div className="space-y-6 pt-4">
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
                <div className="min-w-0 overflow-hidden flex-1">
                  <p className="text-xs text-gray-500">Order ID</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{orderDetails?._id}</p>
                    <button
                      onClick={() => copyOrderId(orderDetails?._id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                      title="Copy Order ID"
                    >
                      {copiedOrderId ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700" />
                      )}
                    </button>
                  </div>
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
                          {item?.productCode && <span>Code: {item.productCode}</span>}
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
              <p className="font-medium text-sm mb-2">{orderDetails?.addressInfo?.name || user?.userName}</p>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="break-words">{formatAddress(orderDetails?.addressInfo?.address)}</div>
                {orderDetails?.addressInfo?.state && (
                  <p>{orderDetails?.addressInfo?.state}</p>
                )}
                <p>{orderDetails?.addressInfo?.city} - {orderDetails?.addressInfo?.pincode}</p>
                <p>Phone: {orderDetails?.addressInfo?.phone}</p>
                {orderDetails?.addressInfo?.notes && (
                  <p className="mt-2 text-gray-500 italic break-words">
                    <span className="font-medium">Landmark:</span> {orderDetails?.addressInfo?.notes}
                  </p>
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
