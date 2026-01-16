"use client";
import React, { useRef } from "react";
import { format } from "date-fns";

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, className, label, helperText, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => internalRef.current!);

    const displayValue = value ? format(new Date(value as string), "dd-MM-yyyy") : "";

    const handleContainerClick = () => {
      if (props.disabled) return;
      try {
        // Modern approach: showPicker()
        if (internalRef.current?.showPicker) {
          internalRef.current.showPicker();
        } else {
          // Fallback
          internalRef.current?.focus();
          internalRef.current?.click();
        }
      } catch (e) {
        console.error("showPicker failed", e);
      }
    };

    const inputContent = (
      <div 
        className="relative cursor-pointer group"
        onClick={handleContainerClick}
      >
        {/* Formatted Text Presentation */}
        <input
          type="text"
          readOnly
          value={displayValue}
          placeholder="DD-MM-YYYY"
          className={`input input-bordered w-full font-mono font-bold cursor-pointer bg-base-100 hover:bg-base-200 transition-colors z-10 ${className}`}
          disabled={props.disabled}
        />
        
        {/* Actual Hidden Date Input */}
        <input
          {...props}
          type="date"
          ref={internalRef}
          value={value}
          onChange={onChange}
          className="absolute right-0 bottom-0 w-0 h-0 opacity-0 pointer-events-none"
          aria-hidden="true"
        />

        {/* Icon Overlay */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-60 transition-opacity">
           <span className="text-lg">📅</span>
        </div>
      </div>
    );

    if (!label && !helperText) return inputContent;

    return (
      <div className="form-control w-full">
        {label && (
          <label className="label text-[10px] font-black uppercase opacity-40 ml-2">
            {label}
          </label>
        )}
        {inputContent}
        {helperText && (
          <label className="label">
            <span className="label-text-alt opacity-50">{helperText}</span>
          </label>
        )}
      </div>
    );

  }
);

DateInput.displayName = "DateInput";

export default DateInput;
