import { cn } from "@/utils/cn";
import { InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, "aria-describedby": ariaDescribedBy, ...props }, ref) => {
    const reactId = useId();
    const inputId = id ?? `input-${reactId}`;
    const errorId = `${inputId}-error`;
    const describedBy = [ariaDescribedBy, error ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="mt-1 text-sm text-red-600"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
