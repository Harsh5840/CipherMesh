import { Request, Response } from "express";
import { storage } from "../storage";
import { nanoid } from "nanoid";

interface AuthenticatedRequest extends Request {
  user?: any; // Replit Auth user object with claims property
}

class AuthController {
  async getUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.claims.sub;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.claims.sub;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { firstName, lastName, email } = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        firstName,
        lastName,
        email,
        profileImageUrl: req.user?.claims.profile_image_url
      });

      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          profileImageUrl: updatedUser.profileImageUrl,
          updatedAt: updatedUser.updatedAt
        }
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  }

  async getUserSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.claims.sub;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      let settings = await storage.getUserSettings(userId);
      
      // Create default settings if none exist
      if (!settings) {
        settings = await storage.upsertUserSettings({
          id: nanoid(),
          userId,
          defaultExpiration: '24h',
          defaultMaxDownloads: 1,
          passwordProtectionDefault: false,
          twoFactorEnabled: false,
          loginNotifications: true,
          activityLogs: false
        });
      }

      res.json({
        success: true,
        settings: {
          defaultExpiration: settings.defaultExpiration,
          defaultMaxDownloads: settings.defaultMaxDownloads,
          passwordProtectionDefault: settings.passwordProtectionDefault,
          twoFactorEnabled: settings.twoFactorEnabled,
          loginNotifications: settings.loginNotifications,
          activityLogs: settings.activityLogs
        }
      });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ error: "Failed to fetch user settings" });
    }
  }

  async updateUserSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.claims.sub;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        defaultExpiration,
        defaultMaxDownloads,
        passwordProtectionDefault,
        twoFactorEnabled,
        loginNotifications,
        activityLogs
      } = req.body;

      const settings = await storage.upsertUserSettings({
        id: nanoid(),
        userId,
        defaultExpiration,
        defaultMaxDownloads,
        passwordProtectionDefault,
        twoFactorEnabled,
        loginNotifications,
        activityLogs
      });

      res.json({
        success: true,
        settings: {
          defaultExpiration: settings.defaultExpiration,
          defaultMaxDownloads: settings.defaultMaxDownloads,
          passwordProtectionDefault: settings.passwordProtectionDefault,
          twoFactorEnabled: settings.twoFactorEnabled,
          loginNotifications: settings.loginNotifications,
          activityLogs: settings.activityLogs
        }
      });
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ error: "Failed to update user settings" });
    }
  }
}

export const authController = new AuthController();
