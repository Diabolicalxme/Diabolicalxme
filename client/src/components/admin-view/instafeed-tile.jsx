import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";

function InstafeedTile({ postUrl, handleDelete }) {
  return (
    <div className="relative w-full p-4 border border-gray-200 rounded-lg shadow-lg">
      {/* Post URL */}
      <p className="text-lg md:text-xl break-words">{postUrl}</p>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-4">

 
        
        <Button
            variant="ghost"
            onClick={handleDelete}
            className="text-red-600 border border-red-600 rounded hover:bg-red-700"

          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
      </div>
    </div>
  );
}

export default InstafeedTile;
