import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Session endpoint - ALWAYS returns JSON, never redirects
  app.get("/api/auth/session", async (req: any, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await authStorage.getUser(userId);
        const displayName = user 
          ? [user.firstName, user.lastName].filter(Boolean).join(" ") || null
          : req.user.claims.name || null;
        res.json({
          authenticated: true,
          user: {
            id: user?.id || userId,
            name: displayName,
            email: user?.email || req.user.claims.email || null,
            isAdmin: false,
          }
        });
      } else {
        res.json({
          authenticated: false,
          user: null
        });
      }
    } catch (error) {
      console.error("Session check error:", error);
      res.json({
        authenticated: false,
        user: null
      });
    }
  });

  // Get current authenticated user (requires auth)
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
