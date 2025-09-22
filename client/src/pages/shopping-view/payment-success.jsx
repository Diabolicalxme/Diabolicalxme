import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle, Package, Home } from "lucide-react";

function PaymentSuccessPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Payment Successful | DiabolicalXme</title>
        <meta name="description" content="Your payment has been successfully processed. Thank you for shopping with DiabolicalXme." />
      </Helmet>

      <div className="bg-background min-h-[80vh] flex flex-col">
        {/* Page Header */}
        <div className="bg-muted/10 py-8 border-b border-input">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-light uppercase tracking-wide text-center mb-2">Payment Successful</h1>
            <div className="w-16 h-0.5 bg-primary mx-auto"></div>
          </div>
        </div>



        {/* Success Content */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="max-w-md w-full mx-auto px-4">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-light uppercase tracking-wide mb-4 text-foreground">Thank You For Your Order</h2>
              <div className="w-12 h-0.5 bg-primary mx-auto mb-6"></div>
              <p className="text-muted-foreground mb-8">
                Your payment has been successfully processed. We'll send you a confirmation email with your order details shortly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/shop/account")}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-foreground transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
              >
                <Package className="h-4 w-4" />
                <span>View Orders</span>
              </button>

              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
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
