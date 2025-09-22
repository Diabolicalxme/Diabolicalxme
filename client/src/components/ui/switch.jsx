import React from "react";
import { cn } from "@/lib/utils"; // Utility for conditional classNames

export function Switch({ checked = false, onCheckedChange, className, ...props }) {

  return (

    <label
      className={cn(
        "relative inline-flex items-center cursor-pointer",
        className
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only peer"
        {...props}
      />
      <div
        className={cn(
          "w-11 h-6 bg-foreground rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-400 transition-all",
          { "ring-red-400": props.error }
        )}
      ></div>
      <div
        className={cn(
          "absolute top-1 left-1 w-4 h-4 bg-background rounded-full transition-transform",
          checked ? "transform translate-x-5" : "transform translate-x-0"
        )}
      ></div>
    </label>
  );
}

export default Switch;
