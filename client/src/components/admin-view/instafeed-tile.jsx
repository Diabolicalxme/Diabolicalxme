import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";

function InstafeedTile({ postUrl, handleDelete }) {
  return (
    <div className="relative w-full p-4 border border-border bg-card text-card-foreground rounded-lg shadow-lg">
      {/* Post URL */}
      <p className="text-lg md:text-xl break-words text-card-foreground">{postUrl}</p>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-4">
        <Button
            variant="ghost"
            onClick={handleDelete}
            className="text-red-600 border border-red-600 rounded hover:bg-red-700 hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
      </div>
    </div>
  );
}

export default InstafeedTile;
