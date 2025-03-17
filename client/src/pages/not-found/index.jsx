import { useEffect, useState } from "react";

function NotFound() {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsShaking(true), 2000); // Start shaking after 2 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black to-gray-800 text-white overflow-hidden">
      <div className={`text-center transform transition-all ${isShaking ? "animate-shake" : "opacity-0 scale-50 animate-fadeIn"}`}>
        <h1 className="text-9xl font-extrabold text-red-500 mb-6">404</h1>
        <p className="text-xl font-light mb-8">This page doesn't exist.</p>
        <button
          onClick={() => window.location.href = "/shop/home"}
          className="px-6 py-3 text-lg font-semibold bg-red-500 hover:bg-red-600 rounded-lg transition duration-300"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
}

export default NotFound;
