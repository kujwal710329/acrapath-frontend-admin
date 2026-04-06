"use client";

import { useState } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { apiRequest } from "@/utilities/api";
import { showError, showPromise } from "@/utilities/toast";
import { SkeletonLoader } from "@/components/common/Skeleton";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AuthForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [authMode, setAuthMode] = useState(null); // "login" | "signup"

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

  const setFieldError = (field, message) =>
    setErrors((prev) => ({ ...prev, [field]: message }));

  const clearFieldError = (field) =>
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });

  const handleContinue = async () => {
    clearFieldError("email");

    if (!email) {
      setFieldError("email", "Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError(
        "email",
        "Enter a valid email address (e.g. name@domain.com)",
      );
      return;
    }

    try {
      setLoading(true);
      const req = apiRequest("/users/verifyMail", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      const res = await showPromise(req, {
        loading: "Verifying email...",
        success: "Verified",
        error: "Failed to verify email",
      });

      if (res.requiresOTP) {
        router.push(`/otp?email=${email}`);
        return;
      }

      if (res.requiresLogin) {
        setAuthMode("login");
        setShowPasswordFields(true);
        return;
      }

      if (res.canRegister) {
        setAuthMode("signup");
        setShowPasswordFields(true);
        return;
      }
    } catch (err) {
      setFieldError("email", err.message);
      showError(err.message || "Failed to verify email");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    clearFieldError("password");

    if (!password) {
      setFieldError("password", "Password is required");
      return;
    }

    try {
      setLoading(true);
      const req = apiRequest("/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const res = await showPromise(req, {
        loading: "Logging in...",
        success: "Logged in successfully",
        error: "Login failed",
      });

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("isAuthenticated", "true");

      router.push("/admin/overview");
    } catch (err) {
      if (err.message?.toLowerCase().includes("verify")) {
        router.push(`/otp?email=${email}`);
      } else {
        setFieldError("password", err.message || "Incorrect password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const newErrors = {};

    if (!password) newErrors.password = "Password is required";
    if (!confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Password and confirm password do not match";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      const req = apiRequest("/users/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
          userType: "admin",
        }),
      });

      await showPromise(req, {
        loading: "Creating account...",
        success: "Account created! Check your email for the OTP.",
        error: "Registration failed",
      });

      router.push(`/otp?email=${email}&purpose=signup`);
    } catch (err) {
      setFieldError("form", err.message);
      showError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-16 sm:pb-20 md:pb-24">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <SkeletonLoader height="h-6" width="w-48" count={1} className="mb-4" />
            <SkeletonLoader height="h-4" width="w-full" count={3} className="mb-2" />
          </div>
        </div>
      )}

      <div className="mb-6">
        <Input
          label="Email Address *"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-[var(--color-red)]">{errors.email}</p>
        )}
      </div>

      {showPasswordFields && authMode === "signup" && (
        <div className="mb-[1.125rem] rounded-[0.75rem] bg-[var(--color-primary-shade-100)] px-[1.25rem] py-[0.875rem] text-[0.8125rem] text-black">
          <p className="font-medium">
            We don&apos;t recognise an account with {email}
          </p>
          <p>Please create an account to continue</p>
        </div>
      )}

      {showPasswordFields && (
        <>
          <div className="relative mb-2">
            <Input
              label={authMode === "login" ? "Password *" : "Create Password *"}
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[3.125rem] text-gray-500"
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.password && (
            <p className="mb-3 text-xs text-[var(--color-red)]">{errors.password}</p>
          )}
          {authMode === "login" && (
            <div className="mb-6 flex justify-between text-sm">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await apiRequest("/users/resend-otp", {
                      method: "POST",
                      body: JSON.stringify({ email, purpose: "login" }),
                    });

                    router.push(`/otp?email=${email}&purpose=login`);
                  } catch (err) {
                    setFieldError("form", err.message);
                  }
                }}
                className="font-medium text-[var(--color-primary)] cursor-pointer hover:underline"
              >
                Sign in using email OTP
              </button>
            </div>
          )}

          {authMode === "signup" && (
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-[1.125rem] text-gray-500"
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          )}
        </>
      )}

      {errors.form && (
        <p className="mb-3 text-xs text-[var(--color-red)]">{errors.form}</p>
      )}

      {!showPasswordFields && (
        <Button enterKey onClick={handleContinue} disabled={loading}>Continue with email</Button>
      )}

      {showPasswordFields && authMode === "login" && (
        <Button enterKey onClick={handleLogin} disabled={loading}>
          Login
        </Button>
      )}

      {showPasswordFields && authMode === "signup" && (
        <Button enterKey className="mt-4" onClick={handleRegister} disabled={loading}>
          Create Account
        </Button>
      )}

      <p className="pt-[1.5rem] pb-[3rem] text-[0.75rem] text-black">
        By continuing, you agree to the Terms of use &amp; Privacy Policy of
        Credepath
      </p>
    </div>
  );
}
