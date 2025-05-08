// utils/sessionSync.ts

import Parse from "parse";

import ParseClient from "@/services/ParseClient";

export class SessionSync {
  private static retryCount = 0;
  private static maxRetries = 3;
  private static retryDelay = 1000;

  public static async ensureValidSession(): Promise<void> {
    if (typeof window === "undefined") return;

    const sessionToken = localStorage.getItem("sessionToken");
    if (!sessionToken) return;

    try {
      // Verify current session
      await Parse.User.become(sessionToken);
      ParseClient.updateSessionToken(sessionToken);
      this.retryCount = 0; // Reset retry counter on success
    } catch (error) {
      console.warn("Session validation failed, attempt", this.retryCount + 1);
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        await new Promise<void>((resolve) => setTimeout(resolve, this.retryDelay));
        return this.ensureValidSession();
      }
      // Clear invalid token after max retries
      localStorage.removeItem("sessionToken");
      this.retryCount = 0;
      throw error;
    }
  }

  public static async withSessionRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
      await this.ensureValidSession();
      return await operation();
    } catch (error) {
      console.error("Operation failed after session retry:", error);
      throw error;
    }
  }
}
