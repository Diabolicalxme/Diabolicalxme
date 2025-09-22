import { useState, useEffect } from "react";

/**
 * RotatingMessages component displays a series of messages that rotate at a specified interval
 * 
 * @param {Object} props
 * @param {Array<string>} props.messages - Array of message strings to display
 * @param {number} [props.interval=5000] - Rotation interval in milliseconds
 * @param {string} [props.className] - Additional CSS classes for the container
 */
function RotatingMessages({ messages, interval = 5000, className = "" }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Set up message rotation with useEffect
  useEffect(() => {
    // Only set up the interval if we have more than one message to display
    if (messages.length <= 1) return;
    
    // Set up an interval to rotate through messages
    const intervalId = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, interval);
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, [messages, interval]);

  // If no messages, don't render anything
  if (!messages.length) return null;

  return (
    <div className={`overflow-hidden h-5 flex items-center justify-center ${className}`}>
      <div
        key={currentMessageIndex}
        className="text-xs md:text-sm font-medium text-center animate-fade-in"
      >
        {messages[currentMessageIndex]}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}} />
    </div>
  );
}

export default RotatingMessages;