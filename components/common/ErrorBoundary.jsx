"use client";

import React from "react";
import { logger } from "@/utilities/logger";
import Icon from "@/components/common/Icon";

/**
 * Error Boundary Component for React
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for monitoring
    logger.critical("Error Boundary Caught Error", {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Check if error count is high - might indicate a serious issue
      if (this.state.errorCount > 3) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
            <div className="text-center max-w-md">
              <Icon
                name="statics/login/cross-icon.svg"
                width={48}
                height={48}
                className="mx-auto mb-4 text-red-500"
              />
              <h1 className="text-2xl font-bold text-[var(--color-black-shade-900)] mb-2">
                Application Error
              </h1>
              <p className="text-[var(--color-black-shade-700)] mb-6">
                The application has encountered multiple errors. Please refresh the page completely or contact support.
              </p>
              <button
                onClick={() => window.location.href = "/"}
                className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
              >
                Go to Home
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
          <div className="text-center max-w-md bg-white rounded-2xl shadow-lg p-8">
            <Icon
              name="statics/login/cross-icon.svg"
              width={48}
              height={48}
              className="mx-auto mb-4 text-orange-500"
            />

            <h1 className="text-2xl font-bold text-[var(--color-black-shade-900)] mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-[var(--color-black-shade-700)] mb-4">
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                <summary className="font-semibold text-[var(--color-red)] cursor-pointer mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-[var(--color-red)] overflow-auto whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs text-[var(--color-red)] overflow-auto mt-2 whitespace-pre-wrap break-words">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="flex-1 border border-[var(--color-black-shade-300)] text-[var(--color-black-shade-800)] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Go Home
              </button>
            </div>

            <p className="text-xs text-[var(--color-black-shade-600)] mt-4">
              Error ID: {Math.random().toString(36).substr(2, 9)}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
