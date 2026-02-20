import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, children, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-game-text-muted mb-1">
            {label}
            {props.required && <span className="text-game-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full bg-game-darker border rounded px-3 py-2 pr-10 text-sm text-game-text appearance-none transition-colors",
              "focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              hasError
                ? "border-game-danger focus:border-game-danger"
                : "border-game-border focus:border-game-accent",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 flex items-center">
            <svg
              className="w-5 h-5 text-game-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </div>
        {error && <p className="mt-1 text-xs text-game-danger">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-game-text-muted">{helperText}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
