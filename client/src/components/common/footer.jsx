import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { useSelector } from "react-redux";
import logo from "@/assets/logo.png";
import { getFooterClasses } from "@/utils/theme-utils";

// Updated policies data with structured content for scrollable dialog
const policiesData = [
  {
    id: "privacy",
    title: "Privacy Policy",
    content: [
      {
        type: "text",
        value: "At DiabolicalXme, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our services."
      },
      {
        type: "section",
        heading: "Information We Collect",
        points: [
          "Personal information you provide directly to us, such as when you create an account, make a purchase, or contact us",
          "Usage data and analytics to improve our services and user experience",
          "Device information and technical data for security and optimization purposes",
          "Communication preferences and marketing consent"
        ]
      },
      {
        type: "section",
        heading: "How We Use Your Information",
        points: [
          "To provide, maintain, and improve our services and products",
          "To process transactions and manage your orders",
          "To communicate with you about your account, orders, and promotional offers",
          "To personalize your shopping experience and recommend products",
          "To detect, prevent, and address technical issues and security threats"
        ]
      },
      {
        type: "section",
        heading: "Information Sharing and Disclosure",
        points: [
          "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent",
          "We may share information with trusted service providers who assist us in operating our website and conducting business",
          "We may disclose information when required by law or to protect our rights and safety",
          "Anonymous, aggregated data may be shared for analytical purposes"
        ]
      },
      {
        type: "section",
        heading: "Data Security",
        points: [
          "We implement appropriate security measures to protect your personal information",
          "Your data is encrypted during transmission and stored securely",
          "We regularly review and update our security practices",
          "Access to personal information is restricted to authorized personnel only"
        ]
      },
      {
        type: "section",
        heading: "Your Rights",
        points: [
          "You have the right to access, update, or delete your personal information",
          "You can opt-out of marketing communications at any time",
          "You can request a copy of the data we hold about you",
          "Contact us if you wish to exercise any of these rights"
        ]
      }
    ]
  },
  {
    id: "terms",
    title: "Terms of Service",
    content: [
      {
        type: "text",
        value: "Welcome to DiabolicalXme. These Terms of Service govern your use of our website and services. By accessing and using our platform, you agree to be bound by these terms."
      },
      {
        type: "section",
        heading: "Acceptance of Terms",
        points: [
          "By accessing and using this website, you accept and agree to be bound by these terms and conditions",
          "If you do not agree to these terms, please do not use our services",
          "We reserve the right to modify these terms at any time with notice",
          "Continued use of our services constitutes acceptance of any changes"
        ]
      },
      {
        type: "section",
        heading: "Use of Our Services",
        points: [
          "You must be at least 18 years old to make purchases on our website",
          "You are responsible for maintaining the confidentiality of your account information",
          "You agree to provide accurate and complete information when creating an account",
          "You must not use our services for any illegal or unauthorized purposes"
        ]
      },
      {
        type: "section",
        heading: "Product Information and Pricing",
        points: [
          "We strive to provide accurate product descriptions and pricing information",
          "Product colors may vary slightly due to monitor settings and photography",
          "Prices are subject to change without notice",
          "We reserve the right to correct any errors in product information or pricing"
        ]
      },
      {
        type: "section",
        heading: "Orders and Payment",
        points: [
          "All orders are subject to acceptance and availability",
          "Payment must be received before order processing",
          "We accept various payment methods as displayed at checkout",
          "You are responsible for any applicable taxes and shipping charges"
        ]
      },
      {
        type: "section",
        heading: "Intellectual Property",
        points: [
          "All content on this website is owned by or licensed to DiabolicalXme",
          "This includes design, layout, graphics, text, and other materials",
          "Unauthorized use of our content may result in legal action",
          "You may not reproduce, distribute, or create derivative works without permission"
        ]
      },
      {
        type: "section",
        heading: "Limitation of Liability",
        points: [
          "Your use of our website and services is at your own risk",
          "We are not liable for any indirect, incidental, or consequential damages",
          "Our liability is limited to the maximum extent permitted by law",
          "We do not warrant that our services will be uninterrupted or error-free"
        ]
      }
    ]
  },
  {
    id: "return",
    title: "Return Policy",
    content: [
      {
        type: "text",
        value: "We want you to be completely satisfied with your purchase. Our return policy is designed to make the process as simple and convenient as possible."
      },
      {
        type: "section",
        heading: "Return Eligibility",
        points: [
          "Items must be returned within 30 days of delivery",
          "Products must be in original condition with tags attached",
          "Items must be unworn, unwashed, and free from damage",
          "Original packaging and accessories must be included"
        ]
      },
      {
        type: "section",
        heading: "Return Process",
        points: [
          "Contact our customer service team to initiate a return",
          "We will provide you with a return authorization and shipping label",
          "Package items securely and attach the provided shipping label",
          "Drop off the package at any authorized shipping location"
        ]
      },
      {
        type: "section",
        heading: "Refunds and Exchanges",
        points: [
          "Refunds will be processed within 5-7 business days after we receive your return",
          "Refunds will be issued to the original payment method",
          "Exchanges are available for different sizes or colors of the same item",
          "Shipping costs are non-refundable unless the return is due to our error"
        ]
      },
      {
        type: "section",
        heading: "Non-Returnable Items",
        points: [
          "Intimate apparel and swimwear for hygiene reasons",
          "Customized or personalized items",
          "Items damaged by normal wear and tear",
          "Products returned after the 30-day return window"
        ]
      }
    ]
  },
  {
    id: "cancellation",
    title: "Cancellation Policy",
    content: [
      {
        type: "text",
        value: "We understand that sometimes you may need to cancel your order. Here's our cancellation policy to help you understand your options."
      },
      {
        type: "section",
        heading: "Order Cancellation",
        points: [
          "Orders can be cancelled within 2 hours of placement",
          "Once an order is processed for shipping, it cannot be cancelled",
          "To cancel an order, contact our customer service immediately",
          "Cancelled orders will be refunded within 3-5 business days"
        ]
      },
      {
        type: "section",
        heading: "Cancellation Process",
        points: [
          "Log into your account and go to 'My Orders'",
          "Find the order you wish to cancel and click 'Cancel Order'",
          "If the cancel option is not available, contact customer service",
          "You will receive a confirmation email once the cancellation is processed"
        ]
      },
      {
        type: "section",
        heading: "Refund for Cancelled Orders",
        points: [
          "Full refund will be issued for successfully cancelled orders",
          "Refunds will be processed to the original payment method",
          "Processing time may vary depending on your payment provider",
          "No cancellation fees will be charged"
        ]
      },
      {
        type: "section",
        heading: "Special Circumstances",
        points: [
          "Pre-order items may have different cancellation terms",
          "Sale items may have restricted cancellation policies",
          "Custom orders cannot be cancelled once production begins",
          "Contact us for assistance with special circumstances"
        ]
      }
    ]
  }
];

const Footer = () => {
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const { currentTheme } = useSelector((state) => state.theme);

  // Policy dialog handlers
  const openPolicyDialog = (policy) => {
    setSelectedPolicy(policy);
    setPolicyDialogOpen(true);
  };

  const closePolicyDialog = () => {
    setSelectedPolicy(null);
    setPolicyDialogOpen(false);
  };

  // Get theme-aware classes using centralized utility

  return (
    <footer className={getFooterClasses(currentTheme)}>
      <div className="container mx-auto py-12 px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Section - Logo and About */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <Link to="/shop/home" className="block mb-6">
              <img src={logo} alt="DiabolicalXme" className="h-12" />
            </Link>

            {/* Social Media Icons */}
            <div className="flex space-x-4 mb-6">
              <a href="#" className="hover:opacity-70 transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="hover:opacity-70 transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="hover:opacity-70 transition-colors">
                <FaFacebook size={20} />
              </a>
            </div>

            {/* About Text */}
            <p className="opacity-80 mb-6">
              Welcome to, your fashion destination. Discover the latest trends, find perfect pieces for your wardrobe, and enjoy seamless online shopping.
            </p>
          </div>

          {/* Middle Section - Empty Space */}
          <div className="hidden md:block md:col-span-2 lg:col-span-4">
            {/* Intentionally left empty for spacing */}
          </div>

          {/* Right Section - Three Columns */}
          <div className="col-span-12 md:col-span-6 lg:col-span-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
              {/* Product Column */}
              <div>
                <h4 className="font-medium mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><Link to="/shop/home" className="opacity-70 hover:opacity-100 transition-opacity">Home</Link></li>
                  <li><Link to="/shop/collections" className="opacity-70 hover:opacity-100 transition-opacity">Advisable</Link></li>
                  <li><Link to="/shop/new-arrivals" className="opacity-70 hover:opacity-100 transition-opacity">Promotions</Link></li>
                </ul>
              </div>

              {/* Company Column */}
              <div>
                <h4 className="font-medium mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><Link to="/shop/contact" className="opacity-70 hover:opacity-100 transition-opacity">Contact</Link></li>
                  <li><Link to="/shop/blog" className="opacity-70 hover:opacity-100 transition-opacity">Blog</Link></li>
                  <li><Link to="/shop/faq" className="opacity-70 hover:opacity-100 transition-opacity">FAQ</Link></li>
                </ul>
              </div>

              {/* Legal Column */}
              <div>
                <h4 className="font-medium mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => openPolicyDialog(policiesData.find(p => p.id === "privacy"))}
                      className="opacity-70 hover:opacity-100 transition-opacity text-left"
                    >
                      Privacy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openPolicyDialog(policiesData.find(p => p.id === "terms"))}
                      className="opacity-70 hover:opacity-100 transition-opacity text-left"
                    >
                      Terms
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openPolicyDialog(policiesData.find(p => p.id === "return"))}
                      className="opacity-70 hover:opacity-100 transition-opacity text-left"
                    >
                      Returns
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openPolicyDialog(policiesData.find(p => p.id === "cancellation"))}
                      className="opacity-70 hover:opacity-100 transition-opacity text-left"
                    >
                      Cancellation
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-6 border-t border-opacity-30 text-center md:text-left">
          <p className="opacity-60 text-sm">&copy; {new Date().getFullYear()} DiabolicalXme. All rights reserved.</p>
        </div>
      </div>

      {/* Policy Dialog */}
      <Dialog open={policyDialogOpen} onOpenChange={(open) => !open && closePolicyDialog()}>
        <DialogContent className="w-[90%] md:w-[80vw] bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl mb-4 text-center text-foreground">{selectedPolicy?.title}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="max-h-[70vh] overflow-y-auto">
            {selectedPolicy?.content && (
              <div className="space-y-4">
                {selectedPolicy.content.map((item, index) => (
                  <div key={index}>
                    {item.type === "text" && (
                      <p className="text-card-foreground leading-relaxed">{item.value}</p>
                    )}
                    {item.type === "section" && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-lg mb-3 text-foreground border-b border-border pb-2">{item.heading}</h3>
                        <ol className="list-decimal ml-6 space-y-2">
                          {item.points.map((point, pointIndex) => (
                            <li key={pointIndex} className="text-card-foreground leading-relaxed">{point}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </footer>
  );
};

export default Footer;