import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle, Package, Home, ChevronRight } from "lucide-react";

function PaymentSuccessPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Payment Successful | Rachana Boutique</title>
        <meta name="description" content="Your payment has been successfully processed. Thank you for shopping with Rachana Boutique." />
      </Helmet>

      <div className="bg-white min-h-[80vh] flex flex-col">
        {/* Page Header */}
        <div className="bg-gray-50 py-8 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-light uppercase tracking-wide text-center mb-2">Payment Successful</h1>
            <div className="w-16 h-0.5 bg-black mx-auto"></div>
          </div>
        </div>

     x

        {/* Success Content */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="max-w-md w-full mx-auto px-4">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-light uppercase tracking-wide mb-4">Thank You For Your Order</h2>
              <div className="w-12 h-0.5 bg-black mx-auto mb-6"></div>
              <p className="text-gray-600 mb-8">
                Your payment has been successfully processed. We'll send you a confirmation email with your order details shortly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/shop/account")}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-black bg-qhite text-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
              >
                <Package className="h-4 w-4" />
                <span>View Orders</span>
              </button>

              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
              >
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentSuccessPage;
