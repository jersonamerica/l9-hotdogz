import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-game-text-muted mb-1">
            {label}
            {props.required && <span className="text-game-danger ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full bg-game-darker border rounded px-3 py-2 text-sm text-game-text placeholder-game-text-muted transition-colors resize-y",
            "focus:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            hasError
              ? "border-game-danger focus:border-game-danger"
              : "border-game-border focus:border-game-accent",
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-game-danger">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-game-text-muted">{helperText}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
