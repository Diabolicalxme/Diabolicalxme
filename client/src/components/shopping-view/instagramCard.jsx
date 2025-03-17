import React from "react";
import { CircleX } from "lucide-react";
import { InstagramEmbed } from "react-social-media-embed";

const InstagramCard = ({ post, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out" 
            onClick={onClose} // Close on click outside the card
        >
            {/* Card Content */}
            <div 
                className="relative w-full md:w-1/3 bg-card rounded-lg shadow-2xl transition-transform transform duration-300 ease-in-out"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
            >
                
                {/* Instagram Embed - Make sure it takes full height and scrollable */}
                <div className="custom-scrollbar"> {/* Fixed height and custom scrollbar */}
                    <InstagramEmbed url={post} width="100%" captioned />
                </div>
                
              
            </div>
             
              <CircleX className="absolute top-8 right-8 w-8 h-8 text-foreground hover:text-accent cursor-pointer" onClick={onClose} />
        </div>
    );
};

export default InstagramCard;
