"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ComponentType, InputHTMLAttributes, ReactNode } from "react";

/**
 * Shared auth form primitives — icons, focus rings and error states
 * are kept consistent across every page of the flow.
 */

export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600" role="alert">
      <AlertCircle className="w-4 h-4 shrink-0" />
      {message}
    </p>
  );
}

type BaseFieldProps = {
  label: string;
  icon: LucideIcon | ComponentType<{ className?: string }>;
  error?: string | null;
  hint?: ReactNode;
  optional?: boolean;
};

export function TextField({
  label,
  icon: Icon,
  error,
  hint,
  optional,
  ...props
}: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-semibold text-navy-700 mb-1.5 font-head">
        {label} {optional && <span className="font-normal text-navy-400">(optional)</span>}
      </label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-navy-300 group-focus-within:text-quest-600 transition-colors" />
        <input
          {...props}
          className={`w-full pl-11 pr-4 py-3 rounded-xl bg-navy-50/60 border text-navy-900 placeholder:text-navy-300 font-head text-[15px] focus:outline-none focus:ring-4 focus:ring-quest-500/10 focus:border-quest-500 focus:bg-white transition-all ${
            error ? "border-red-300 bg-red-50/40" : "border-navy-900/10"
          }`}
        />
      </div>
      <FieldError message={error} />
      {hint}
    </div>
  );
}

export function passwordStrength(pw: string): { score: number; label: string; bar: string; text: string } {
  if (!pw) return { score: 0, label: "", bar: "bg-navy-100", text: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 14) score++;
  if (score <= 1) return { score: 1, label: "Weak", bar: "bg-red-500", text: "text-red-600" };
  if (score === 2) return { score: 2, label: "Fair", bar: "bg-amber-500", text: "text-amber-600" };
  if (score === 3) return { score: 3, label: "Good", bar: "bg-quest-400", text: "text-quest-700" };
  return { score: 4, label: "Strong", bar: "bg-quest-500", text: "text-quest-700" };
}

export function PasswordField({
  label,
  icon: Icon,
  error,
  hint,
  showStrength,
  value,
  ...props
}: BaseFieldProps & InputHTMLAttributes<HTMLInputElement> & { showStrength?: boolean }) {
  const [show, setShow] = useState(false);
  const strength = passwordStrength(String(value ?? ""));
  const rulesMet = {
    len: String(value ?? "").length >= 8,
    upper: /[A-Z]/.test(String(value ?? "")),
    num: /\d/.test(String(value ?? "")),
  };

  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-semibold text-navy-700 mb-1.5 font-head">
        {label}
      </label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-navy-300 group-focus-within:text-quest-600 transition-colors" />
        <input
          {...props}
          type={show ? "text" : "password"}
          value={value}
          className={`w-full pl-11 pr-12 py-3 rounded-xl bg-navy-50/60 border text-navy-900 placeholder:text-navy-300 font-head text-[15px] focus:outline-none focus:ring-4 focus:ring-quest-500/10 focus:border-quest-500 focus:bg-white transition-all ${
            error ? "border-red-300 bg-red-50/40" : "border-navy-900/10"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-500 transition-colors"
        >
          {show ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
        </button>
      </div>

      {showStrength && value ? (
        <div className="mt-2.5">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-navy-900/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strength.bar}`}
                style={{ width: `${(strength.score / 4) * 100}%` }}
              />
            </div>
            <span className={`font-head text-xs font-semibold ${strength.text}`}>{strength.label}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {[
              { ok: rulesMet.len, text: "8+ characters" },
              { ok: rulesMet.upper, text: "Uppercase letter" },
              { ok: rulesMet.num, text: "Number" },
            ].map((r) => (
              <span
                key={r.text}
                className={`inline-flex items-center gap-1 font-head text-xs ${r.ok ? "text-quest-700" : "text-navy-400"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${r.ok ? "bg-quest-500" : "bg-navy-200"}`} />
                {r.text}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      <FieldError message={error} />
      {hint}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-head animate-[hbfade_.25s_ease]">
      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/* ---------- 6-digit OTP input ---------- */

export function OtpInput({
  value,
  onChange,
  onComplete,
  invalid,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setDigit = (i: number, d: string) => {
    const next = (value.slice(0, i) + d + value.slice(i + 1)).slice(0, 6);
    onChange(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
    if (next.length === 6 && !next.includes("") && onComplete) onComplete(next);
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3" role="group" aria-label="6-digit verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          value={d}
          onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, "").slice(-1))}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (!pasted) return;
            onChange(pasted);
            if (pasted.length === 6 && onComplete) onComplete(pasted);
            refs.current[Math.min(pasted.length, 5)]?.focus();
          }}
          className={`w-full aspect-[3/4] sm:aspect-square text-center font-display text-2xl font-bold rounded-xl border-2 text-navy-900 focus:outline-none focus:ring-4 focus:ring-quest-500/15 transition-all disabled:opacity-50 ${
            invalid ? "border-red-300 bg-red-50 animate-[hbshake_.3s_ease]" : d ? "border-quest-500 bg-quest-50/60" : "border-navy-900/10 bg-navy-50/60 focus:border-quest-500 focus:bg-white"
          }`}
        />
      ))}
    </div>
  );
}
