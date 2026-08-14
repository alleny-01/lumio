import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: string | ReactNode;
  id: string;
  error?: string;
  forgotPasswordLink?: boolean;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  showPasswordToggle?: boolean;
}

function Input({
  label,
  icon,
  id,
  error,
  value,
  forgotPasswordLink = false,
  onChange,
  showPasswordToggle = false,
  type: initialType = "text",
  ...props
}: InputFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = initialType === "password";
  const shouldShowToggle = showPasswordToggle && isPasswordField;
  const inputType =
    shouldShowToggle && isPasswordVisible ? "text" : initialType;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-center px-1">
        <label className="text-xs font-normal tracking-wide" htmlFor={id}>
          {label}
        </label>
      </div>
      <div className="group">
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline text-base">
                {icon}
              </span>
            </div>
          )}
          <input
            className={`w-full ${
              icon ? "pl-11" : "pl-4"
            } ${shouldShowToggle ? "pr-11" : "pr-4"} py-3 bg-surface-container-low border-none  rounded-sm focus:bg-surface-container-lowest transition-all duration-200 outline-none placeholder:text-outline/60 placeholder:text-xs placeholder:tracking-wide text-sm ring-1 ring-transparent focus:ring-1 focus:ring-primary/5`}
            id={id}
            type={inputType}
            value={value}
            onChange={onChange}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />

          {shouldShowToggle && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              aria-label={
                isPasswordVisible ? "Hide password" : "Show password"
              }
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-outline transition-colors duration-200 hover:text-primary"
            >
              {isPasswordVisible ? (
                <EyeOff size={17} strokeWidth={1} aria-hidden="true" />
              ) : (
                <Eye size={17} strokeWidth={1} aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {forgotPasswordLink && (
          <Link
            to="/forgot-password"
            className="font-normal hover:underline underline-offset-4 decoration-2 decoration-primary/30 transition-all text-xs flex justify-end pt-4"
          >
            Forgot password?
          </Link>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="px-1 text-[11px] text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default Input;
