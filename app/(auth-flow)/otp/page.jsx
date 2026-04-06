"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Button from "@/components/common/Button";
import { IoChevronBackOutline } from "react-icons/io5";
import { apiRequest } from "@/utilities/api";

export default function OtpPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") || "";
  const purpose = params.get("purpose") || "signup";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputsRef = useRef([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, "$1********$2");

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await apiRequest("/users/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email,
          otp: code,
          purpose, 
        }),
      });

      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem("isAuthenticated", "true");

        
        router.push("/admin/overview");
        return;
      }

      router.push(`/login?email=${email}`);
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      setError("");
      setResendCooldown(30);
      await apiRequest("/users/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email, purpose }),
      });
    } catch (err) {
      setError(err.message);
      setResendCooldown(0);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-white px-4 pt-20 sm:px-6 sm:pt-24">
      <div className="relative w-full max-w-[29rem] rounded-xl border border-[var(--color-black-shade-200)] bg-white px-6 py-8 sm:px-8 sm:py-9">
        <button
          onClick={() => router.back()}
          className="absolute -left-[4.375rem] top-0 hidden h-8 w-8 items-center justify-center rounded-full bg-[var(--color-black-shade-100)] transition hover:bg-[var(--color-black-shade-200)] sm:flex"
        >
          <IoChevronBackOutline
            size={18}
            className="text-[var(--color-black-shade-700)]"
          />
        </button>

        <h2 className="mb-2 text-center text-xl font-semibold text-black">
          OTP Verification
        </h2>

        <p className="mb-2 text-center text-sm font-semibold text-[var(--color-black-shade-700)]">
          Enter one-time password
        </p>

        <p className="mb-4 text-center text-sm text-[var(--color-black-shade-700)]">
          A one-time password has been sent to
        </p>

        <p className="mb-5 text-center text-sm font-medium text-black">
          {maskedEmail}
        </p>

        <p className="mb-5 text-center text-sm text-[var(--color-black-shade-700)]">
          Enter the 6-digit code we sent you via email to continue
        </p>

        <div className="mb-6 flex justify-center gap-3 sm:gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                if (el) inputsRef.current[index] = el;
              }}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength={1}
              className="h-13 w-13 rounded-lg border border-[var(--color-black-shade-300)] text-center text-lg font-medium outline-none focus:border-[var(--color-primary)] sm:h-14 sm:w-14"
            />
          ))}
        </div>

        {error && (
          <p className="mb-3 text-center text-xs text-[var(--color-red)]">
            {error}
          </p>
        )}

        <p className="mb-2 text-center text-sm">
          <span className="cursor-pointer font-medium text-[var(--navbar-button-text)]">
            Not your email?
          </span>{" "}
          / Didn’t receive the code?
        </p>

        <p
          onClick={handleResend}
          className={`mb-7 text-center text-sm font-medium transition-colors ${
            resendCooldown > 0
              ? "cursor-not-allowed text-(--color-black-shade-400)"
              : "cursor-pointer text-(--navbar-button-text)"
          }`}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Send again"}
        </p>

        <Button
          enterKey
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-[var(--color-black-shade-100)] text-black hover:opacity-90"
        >
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </div>
    </div>
  );
}
