
import * as React from "react"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  const textareaRef = useRef(null);

  // Combine the forwarded ref with our local ref
  const handleRef = (element) => {
    textareaRef.current = element;

    // If a ref was passed, forward it
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };

  // Function to adjust the height of the textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Set the height to the scrollHeight to fit the content
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Adjust height on mount and when content changes
  useEffect(() => {
    adjustHeight();
  }, [props.value, props.defaultValue]);

  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden resize-none",
        className
      )}
      ref={handleRef}
      onInput={adjustHeight}
      {...props}
    />
  );
})
Textarea.displayName = "Textarea"

export { Textarea }

