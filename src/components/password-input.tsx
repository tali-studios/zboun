"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  id: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
};

export function PasswordInput({
  id,
  name,
  required,
  placeholder,
  autoComplete,
  className = "ui-input",
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`password-input-field ${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-slate-600"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" strokeWidth={2} aria-hidden />
        ) : (
          <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
        )}
      </button>
    </div>
  );
}
