/**
 * Enhanced Logging Utility for Production SaaS
 * Provides structured logging with severity levels
 */

const LOG_LEVELS = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  CRITICAL: "critical",
};

const isDevelopment = process.env.NODE_ENV === "development";

class Logger {
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(Object.keys(data).length > 0 && { data }),
      url: typeof window !== "undefined" ? window.location.href : "ssr",
    };

    if (isDevelopment) {
      const colors = {
        debug: "color: #888",
        info: "color: #00f",
        warn: "color: #ff8800",
        error: "color: #f00",
        critical: "background: #f00; color: white",
      };
      console.log(
        `%c[${level.toUpperCase()}]`,
        colors[level] || "",
        message,
        data
      );
    }

   // In production, send to monitoring service
    if (!isDevelopment && level === LOG_LEVELS.ERROR) {
      this.sendToMonitoring(logEntry);
    }

    return logEntry;
  }

  debug(message, data) {
    return this.log(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data) {
    return this.log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data) {
    return this.log(LOG_LEVELS.WARN, message, data);
  }

  error(message, data) {
    return this.log(LOG_LEVELS.ERROR, message, data);
  }

  critical(message, data) {
    return this.log(LOG_LEVELS.CRITICAL, message, data);
  }

  sendToMonitoring(logEntry) {
    // TODO: Integrate with your monitoring service (Sentry, LogRocket, etc)
    // Example: Sentry.captureMessage(logEntry.message, logEntry.level);
    if (typeof window !== "undefined") {
      navigator.sendBeacon("/api/logs", JSON.stringify(logEntry));
    }
  }
}

export const logger = new Logger();
