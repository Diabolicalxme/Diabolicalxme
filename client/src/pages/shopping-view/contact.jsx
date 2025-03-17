import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Instagram, Mail, Phone, MessageSquare } from "lucide-react";
import banner from "../../assets/account.jpg";
import { createContact } from "@/store/shop/contact-slice";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet-async";

const Contact = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  // Access the shopContact state from Redux store
  const { isLoading, error } = useSelector((state) => state.shopContact);

  // Local state for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  // State to track if form is valid
  const [isFormValid, setIsFormValid] = useState(false);

  // Check for validations whenever the input values change
  useEffect(() => {
    // Simple validation: required fields must not be empty.
    if (name.trim() && email.trim() && message.trim()) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [name, email, message]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check again if all fields are filled before dispatching.
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all fields before submitting.",
      });
      return;
    }

    // Dispatch the createContact thunk
    const resultAction = await dispatch(createContact({ name, email, message }));
    if (createContact.fulfilled.match(resultAction)) {
      // Clear the form fields after successful submission
      setName("");
      setEmail("");
      setMessage("");
      toast({
        title: "Success",
        description: "Your message has been sent successfully!",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | DiabolicalXme</title>
        <meta name="description" content="Get in touch with DiabolicalXme for any questions or inquiries about our saree collections." />
      </Helmet>

      <div className="bg-white">
        {/* Page Header */}
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
          <img
            src={banner}
            alt="Contact Us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-35 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-light uppercase tracking-wide text-white mb-4">Contact Us</h1>
              <div className="w-24 h-1 bg-white mx-auto"></div>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">Get In Touch</h2>
              <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
              <p className="text-gray-600">We'd love to hear from you. Here's how you can reach us.</p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="bg-white p-8 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Phone className="h-8 w-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-medium mb-2">Phone Number</h3>
                <p className="text-gray-600">+91 9944783389</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
              {/* Left Side: Form */}
              <div className="w-full md:w-2/3 bg-white p-8 shadow-md">
                <div className="mb-8">
                  <h2 className="text-3xl font-light uppercase tracking-wide mb-4">Send Us A Message</h2>
                  <div className="w-16 h-1 bg-black mb-6"></div>
                  <p className="text-gray-600">Have a question? Let us know, and we'll get back to you as soon as possible.</p>
                </div>

                <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2 uppercase tracking-wide">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      className="w-full border-gray-300 focus:border-black focus:ring-black"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2 uppercase tracking-wide">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="w-full border-gray-300 focus:border-black focus:ring-black"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2 uppercase tracking-wide">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      rows="6"
                      placeholder="Write your message here..."
                      className="w-full border-gray-300 focus:border-black focus:ring-black"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-center">{error}</p>
                  )}
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading || !isFormValid}
                      className="w-full px-8 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Side: Social Media */}
              <div className="w-full md:w-1/3">
                <div className="bg-gray-100 p-8 shadow-md">
                  <h3 className="text-2xl font-light uppercase tracking-wide mb-4">Connect With Us</h3>
                  <div className="w-16 h-1 bg-black mb-6"></div>
                  <p className="text-gray-600 mb-6">Follow us on social media to stay updated with our latest collections and offers.</p>

                  <div className="flex flex-wrap gap-4">
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-md transition-colors"
                    >
                      <Facebook size={20} className="text-blue-600" />
                      <span>Facebook</span>
                    </a>
                    <a
                      href="https://www.instagram.com/rachanas_boutique?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-md transition-colors"
                    >
                      <Instagram size={20} className="text-pink-600" />
                      <span>Instagram</span>
                    </a>
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-md transition-colors"
                    >
                      <MessageSquare size={20} className="text-green-500" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href="mailto:rachanaboutique@gmail.com"
                      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-md transition-colors"
                    >
                      <Mail size={20} className="text-red-500" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;