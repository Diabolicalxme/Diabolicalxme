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
  // Get status color class
  const getStatusClass = (status) => {
    switch(status) {
      case "confirmed":
        return "bg-green-500/10 text-green-500 border border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      case "delivered":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground border border-border";
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
    <DialogContent className="w-full md:w-[800px] max-h-[90vh] p-0 border-none">
      <div className="mt-4 overflow-y-auto pr-1 -mr-1 max-h-[calc(90vh-80px)] p-6">
        <div className="sticky top-0 bg-background pt-2 pb-4 z-[5] border-b border-border mr-8">
          <DialogTitle className="text-xl font-light uppercase tracking-wide text-center text-foreground">
            Order Details
          </DialogTitle>
          <div className="w-16 h-0.5 bg-primary mx-auto mt-2"></div>
        </div>

        <div className="space-y-6 pt-4">
          {/* Order Summary */}
          <div className="bg-muted/20 p-4 sm:p-6 rounded-md border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h3 className="text-sm uppercase tracking-wide font-medium text-foreground">Order Summary</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(orderDetails?.orderStatus)}`}>
                {orderDetails?.orderStatus?.charAt(0).toUpperCase() + orderDetails?.orderStatus?.slice(1) || "Processing"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 overflow-hidden flex-1">
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate text-foreground">{orderDetails?._id}</p>
                    <button
                      onClick={() => copyOrderId(orderDetails?._id)}
                      className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                      title="Copy Order ID"
                    >
                      {copiedOrderId ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Order Date</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(orderDetails?.orderDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="text-sm font-medium capitalize text-foreground">{orderDetails?.paymentMethod}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Payment Status</p>
                  <p className="text-sm font-medium capitalize text-foreground">{orderDetails?.paymentStatus}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-sm uppercase tracking-wide font-medium mb-3 flex items-center gap-2 text-foreground">
              <Package className="h-4 w-4 flex-shrink-0" />
              <span>Order Items</span>
            </h3>

            <div className="border border-border rounded-md overflow-hidden">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0 ? (
                <div className="divide-y divide-border">
                  {orderDetails.cartItems.map((item, index) => (
                    <div key={index} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-card/30">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate text-foreground">{item.title}</h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                          {item?.productCode && <span>Code: {item.productCode}</span>}
                          {item?.colors?.title && <span>Color: {item?.colors?.title}</span>}
                          <span>Quantity: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-sm font-medium mt-1 sm:mt-0 text-foreground">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">No items found</div>
              )}

              <div className="bg-muted/30 p-3 sm:p-4 flex justify-between items-center border-t border-border">
                <span className="text-sm font-medium text-foreground">Total Amount</span>
                <span className="text-base font-medium text-foreground">{formatCurrency(orderDetails?.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="pb-4">
            <h3 className="text-sm uppercase tracking-wide font-medium mb-3 flex items-center gap-2 text-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>Shipping Information</span>
            </h3>

            <div className="border border-border rounded-md p-3 sm:p-4 bg-muted/10">
              <p className="font-medium text-sm mb-2 text-foreground">{orderDetails?.addressInfo?.name || user?.userName}</p>
              <div className="text-sm text-foreground/80 space-y-1">
                <div className="break-words">{formatAddress(orderDetails?.addressInfo?.address)}</div>
                {orderDetails?.addressInfo?.state && (
                  <p>{orderDetails?.addressInfo?.state}</p>
                )}
                <p>{orderDetails?.addressInfo?.city} - {orderDetails?.addressInfo?.pincode}</p>
                <p>Phone: {orderDetails?.addressInfo?.phone}</p>
                {orderDetails?.addressInfo?.notes && (
                  <p className="mt-2 text-muted-foreground italic break-words">
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
