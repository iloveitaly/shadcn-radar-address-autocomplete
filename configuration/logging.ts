/* eslint-disable no-console */

export const log = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[INFO] ${message}`, data || "")
    }
  },
  error: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[ERROR] ${message}`, data || "")
    }
  },
  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[WARN] ${message}`, data || "")
    }
  },
}
