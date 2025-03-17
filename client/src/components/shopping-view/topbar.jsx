import { useState, useEffect, useRef } from "react";
import { Phone, Instagram, Facebook } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

function TopBar() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  const messages = [
    "🔥 NEW ARRIVALS: Summer Collection 2024 is here!",
    "👗 EXCLUSIVE: 20% off all dresses with code SUMMER24",
    "✨ FREE SHIPPING on orders over ₹1000",
    "🎁 Buy 2 Get 1 Free on all accessories this week",
  ];

  // For announcement messages, use a ref to store the interval ID
  const messageIntervalRef = useRef(null);

  // Set up the message rotation when the component mounts
  // and clean it up when the component unmounts
  useEffect(() => {
    // Only set up if we don't already have an interval
    if (!messageIntervalRef.current) {
      messageIntervalRef.current = setInterval(() => {
        // Use a functional update to avoid dependencies on currentMessageIndex
        setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
      }, 5000);
    }

    // Clean up on unmount
    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="bg-black text-white py-2 px-4">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center">
        <div className="hidden md:flex items-center space-x-4">
          <a href="tel:+919944783389" className="text-xs flex items-center hover:text-gray-300 transition-colors">
            <Phone className="h-3 w-3 mr-1" />
            +91 9944783389
          </a>
          <div className="text-xs">|</div>
          <a href="mailto:rachanaboutique@gmail.com" className="text-xs hover:text-gray-300 transition-colors">
            diabolicalxme@gmail.com
          </a>
        </div>

        <div className="w-full md:w-auto flex justify-center">
          <div className="overflow-hidden h-5">
            <div
              key={currentMessageIndex}
              className="text-xs md:text-sm font-medium text-center animate-fade-in"
              style={{
                animation: 'fadeIn 0.5s ease-in-out',
                opacity: 1,
              }}
            >
              {messages[currentMessageIndex]}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>

        <div className="hidden md:flex items-center space-x-3">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
            <Facebook className="h-4 w-4" />
          </a>
          <a href="https://wa.me/9944783389" className="hover:text-gray-300 transition-colors" target="_blank" rel="noopener noreferrer">
            <FaWhatsapp size={17} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default TopBar;