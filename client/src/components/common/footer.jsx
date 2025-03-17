import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { createSubscription } from "@/store/shop/newsletter-slice";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { Separator } from "../../components/ui/separator";
import { Mail, ArrowRight, Facebook, Instagram, Twitter, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";


// Updated policies data with array of points for numbered rendering
const policiesData = [
  {
    id: "terms",
    title: "Terms & Conditions",
    points: [
      "These are the terms and conditions.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    ]
  },
  {
    id: "return",
    title: "Return Policy",
    points: [
      "This is the return policy.",
      "Nulla facilisi. Praesent interdum, nunc vitae egestas ultricies, eros dolor fermentum nisl."
    ]
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    points: [
      "This is the privacy policy.",
      "Vivamus ut sem eu velit finibus placerat."
    ]
  },
  {
    id: "cancellation",
    title: "Cancellation Policy",
    points: [
      "This is the cancellation policy.",
      "Fusce porta, odio at fringilla semper, lacus justo sodales massa, a facilisis nulla orci ac lorem."
    ]
  }
];

// Quick links routes
const quickLinks = [
  { id: "home", label: "Home", path: "/shop/home" },
  { id: "collections", label: "Collections", path: "/shop/collections" },
  { id: "new-arrivals", label: "New Arrivals", path: "/shop/new-arrivals" },
  { id: "contact", label: "Contact", path: "/shop/contact" },
];

const Footer = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);

  // Access loading state from Redux
  const { isLoading } = useSelector((state) => state.shopNewsLetter);

  // Subscription handler
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    dispatch(createSubscription({ email }))
      .then((res) => {
        if (res.payload?.success) {
          toast({ title: res.payload.message, variant: "success" });
          setEmail("");
        } else if (res.payload?.message === "This email is already subscribed to the newsletter.") {
          toast({ title: "You are already subscribed!", variant: "warning" });
        }
      })
      .catch(() => {
        toast({ title: "Subscription failed. Try again!", variant: "destructive" });
      });
  };

  // Policy dialog handlers
  const openPolicyDialog = (policy) => {
    setSelectedPolicy(policy);
    setPolicyDialogOpen(true);
  };

  const closePolicyDialog = () => {
    setSelectedPolicy(null);
    setPolicyDialogOpen(false);
  };

  return (

    <>

      <div className="bg-background py-6">
        <div className="px-5 md:container flex flex-col gap-4 md:flex-row justify-between  items-center py-12">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-semibold ">Join the Elegance Club</h1>
            <p className="text-lg text-muted-foreground mt-4">
              Stay updated with our latest collections and offers.
            </p>
          </div>

          <div className="w-full md:w-1/3">
            <form onSubmit={handleSubscribe} className="flex items-center border-b-2 border-gray-400 focus-within:border-rose-500">
              <Mail className="text-black mr-2" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full outline-none px-2 py-2 text-lg bg-transparent placeholder-muted-foreground"
              />
              <button type="submit" disabled={isLoading} className="text-rose-600 hover:text-rose-700 transition">
                <ArrowRight size={24} />
              </button>
            </form>
          </div>
        </div>
      </div>
      <footer className="bg-card text-card-foreground">
        <div className="container mx-auto pt-6 pb-3 px-4">
          {/* Flex Container */}
          <div className="flex flex-col md:flex-row md:justify-between md:gap-x-12 gap-y-8">

            {/* About Section */}
            <div className="md:w-[25%]">
              <Link to="/shop/home" className="flex items-center gap-2">
                {/* <img src={logo} alt="Logo" className="w-full md:w-3/4" /> */}
              </Link>
              <p className="text-lg my-4">
                Welcome to our store, where tradition meets elegance. Explore our curated collection of exquisite sarees designed to make every occasion special.
              </p>
            </div>

            {/* Explore Products */}
            <div className="md:w-[20%]">
              <h4 className="text-lg font-semibold text-foreground mb-4">Explore Products</h4>
              <ul className="space-y-2">
                <li><Link to="/shop/home" className="text-md hover:underline hover:text-rose-600 transition">Home</Link></li>
                <li><Link to="/shop/collection" className="text-md hover:underline hover:text-rose-600 transition">Collection</Link></li>
                <li><Link to="/shop/new-arrivals" className="text-md hover:underline hover:text-rose-600 transition">New Arrivals</Link></li>
              </ul>
            </div>

            {/* Policies */}
            <div className="md:w-[20%]">
              <h4 className="text-lg font-semibold text-foreground mb-4">Policies</h4>
              <ul className="space-y-2">
                {policiesData.map((policy) => (
                  <li key={policy.id}>
                    <button onClick={() => openPolicyDialog(policy)} className="hover:underline text-foreground">
                      {policy.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Social Media */}
            <div className="md:w-[25%]">
              <h4 className="text-lg font-semibold text-foreground mb-4">Contact Us</h4>
              <div className="space-y-2 text-md">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-rose-600 mr-2" />
                  <a href="tel:+919944783389" className="hover:underline">+91 9944783389</a>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-rose-600 mr-2" />
                  <a href="mailto:rachanaboutique@gmail.com" className="hover:underline">diabolicalxme@gmail.com</a>
                </div>
                {/* Social Media Links */}
                <div className="flex gap-4 mt-3">
                  <a href="#" className="text-foreground hover:text-rose-600 transition">
                    <Facebook size={24} />
                  </a>
                  <a href="#" className="text-foreground hover:text-rose-600 transition">
                    <Instagram size={24} />
                  </a>
                  <a href="https://wa.me/9944783389" className="text-foreground hover:text-rose-600 transition" target="_blank" rel="noopener noreferrer">
                    <FaWhatsapp size={24} />
                  </a>
                </div>
              </div>
            </div>



          </div>

          {/* Bottom Section */}
          <div className="mt-8 border-t border-border pt-4 text-center text-sm flex flex-col gap-2">
            <div>&copy; {new Date().getFullYear()} DiabolicalXme. All rights reserved.</div>
          </div>
        </div>

        {/* Policy Dialog */}
        <Dialog open={policyDialogOpen} onOpenChange={(open) => !open && closePolicyDialog()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedPolicy?.title}</DialogTitle>
            </DialogHeader>
            {selectedPolicy?.points && (
              <ol className="list-decimal ml-6 space-y-1 text-sm">
                {selectedPolicy.points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ol>
            )}
          </DialogContent>
        </Dialog>
      </footer>
    </>
  );
};

export default Footer;