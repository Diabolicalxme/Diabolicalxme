import Address from "@/components/shopping-view/address";
import img from "../../assets/jamandi.png";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { useState } from "react";
import { createNewOrder, capturePayment } from "@/store/shop/order-slice";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "../../components/ui/loader";
import { Helmet } from "react-helmet-async";
import { ChevronRight, ShoppingBag, MapPin, CreditCard } from "lucide-react";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const {isPaymentLoading} = useSelector((state) => state.shopOrder);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Calculate total with proper type conversion and error handling
  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce((sum, currentItem) => {
          // Get the price (sale price if available, otherwise regular price)
          const itemPrice = currentItem?.salePrice > 0
            ? parseFloat(currentItem.salePrice)
            : parseFloat(currentItem?.price || 0);

          // Get the quantity with fallback to 0
          const itemQuantity = parseInt(currentItem?.quantity || 0, 10);

          // Calculate item total and add to sum
          const itemTotal = itemPrice * itemQuantity;

          // Log for debugging
          console.log(`Checkout - Item: ${currentItem?.title}, Price: ${itemPrice}, Quantity: ${itemQuantity}, Total: ${itemTotal}`);

          return sum + itemTotal;
        }, 0)
      : 0;

  // Format the total to 2 decimal places for display
  const formattedTotal = totalCartAmount.toFixed(2);

  function handleInitiateRazorpayPayment() {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsPaymentStart(true);

    const orderData = {
      userId: user?.id,
      email: user?.email,
      cartId: cartItems?._id,
      cartItems: cartItems.map((item) => ({
        productId: item?.productId,
        title: item?.title,
        image: item?.image[0],
        price: item?.salePrice > 0 ? item?.salePrice : item?.price,
        quantity: item?.quantity,
        colors: item?.colors,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
      },
      totalAmount: totalCartAmount,
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        const { razorpayOrderId, amount, currency } = data.payload;

        if (typeof Razorpay === "undefined") {
          toast({
            title: "Razorpay SDK is not loaded. Please refresh the page.",
            variant: "destructive",
          });
          setIsPaymentStart(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount,
          currency,
          name: "Rachana Boutique",
          description: "Order Payment",
          order_id: razorpayOrderId,
          handler: function (response) {
            dispatch(
              capturePayment({
                paymentId: response.razorpay_payment_id,
                orderId: data.payload.orderId,
              })
            ).then((captureResponse) => {
              if (captureResponse?.payload?.success) {
                toast({
                  title: "Payment successful! Redirecting to the success page...",
                  variant: "success",
                });
                navigate("/shop/payment-success");
              } else {
                toast({
                  title: "Payment was successful, but order confirmation failed. Please contact support.",
                  variant: "destructive",
                });
                setIsPaymentStart(false);
              }
            });
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone,
          },
          theme: {
            color: "#000000",
          },
        };

        const razorpay = new Razorpay(options);
        razorpay.open();

        razorpay.on("payment.failed", function (response) {
          toast({
            title: "Payment failed. Please try again.",
            description: response.error.description,
            variant: "destructive",
          });
          setIsPaymentStart(false);
        });
      } else {
        toast({
          title: "Order creation failed. Please try again.",
          variant: "destructive",
        });
        setIsPaymentStart(false);
      }
    });
  }

  if (isPaymentLoading) return <Loader />;

  if (approvalURL) {
    window.location.href = approvalURL;
  }

  return (
    <>
      <Helmet>
        <title>Checkout | Rachana Boutique</title>
        <meta name="description" content="Complete your purchase at Rachana Boutique. Secure checkout process for your selected items." />
      </Helmet>

      <div className="bg-white">
        {/* Banner */}
        <div className="relative w-full h-[250px] md:h-[300px] overflow-hidden">
          <img
            src={img}
            alt="Checkout"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-light uppercase tracking-wide text-white mb-4">
                Checkout
              </h1>
              <div className="w-24 h-1 bg-white mx-auto"></div>
            </div>
          </div>
        </div>

   

        {/* Checkout Content */}
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-6xl mx-auto">
            {/* Checkout Steps */}
            <div className="mb-12">
              <div className="flex justify-between items-center max-w-md mx-auto">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-2">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-wide">Cart</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-2">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-wide">Address</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mb-2">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-wide">Payment</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side: Address Selection */}
              <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-md shadow-sm">
                <h2 className="text-2xl font-light uppercase tracking-wide mb-4">Shipping Address</h2>
                <div className="w-16 h-0.5 bg-black mb-6"></div>
                <Address
                  selectedId={currentSelectedAddress}
                  setCurrentSelectedAddress={setCurrentSelectedAddress}
                />
              </div>

              {/* Right Side: Order Summary */}
              <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-md shadow-sm">
                <h2 className="text-2xl font-light uppercase tracking-wide mb-4">Order Summary</h2>
                <div className="w-16 h-0.5 bg-black mb-6"></div>

                {/* Cart Items */}
                <div className="space-y-4 mb-8">
                  {cartItems && cartItems.length > 0 ? (
                    cartItems.map((item, index) => (
                      <UserCartItemsContent key={index} cartItem={item} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Your cart is empty
                    </div>
                  )}
                </div>

                {/* Order Totals */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{formattedTotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>₹{formattedTotal}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="mt-8">
                  <button
                    onClick={handleInitiateRazorpayPayment}
                    disabled={isPaymentStart || cartItems.length === 0}
                    className="w-full px-8 py-4 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors duration-300 uppercase tracking-wider text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPaymentStart ? "Processing Payment..." : "Proceed to Payment"}
                  </button>

                  <p className="text-xs text-center text-gray-500 mt-4">
                    By proceeding, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ShoppingCheckout;
