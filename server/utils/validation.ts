import { z } from "zod";
import { File } from "@shared/schema";
import { cryptoService } from "../services/cryptoService";

const fileUploadSchema = z.object({
  originalName: z.string().min(1).max(255),
  fileSize: z.number().min(1).max(100 * 1024 * 1024), // 100MB max
  mimeType: z.string().min(1).max(255),
  publicKey: z.string().min(1),
  iv: z.string().min(1),
  maxDownloads: z.number().min(1).max(100),
  expiryHours: z.number().min(1).max(24 * 7) // Max 7 days
});

const fileAccessSchema = z.object({
  password: z.string().optional()
});

export function validateFileUpload(data: any): { success: boolean; error?: string } {
  try {
    fileUploadSchema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Invalid file upload data' };
  }
}

export function validateFileAccess(file: File, password?: string): { 
  success: boolean; 
  error?: string; 
  status?: number; 
} {
  // Check if file is expired
  if (file.isExpired || new Date() > file.expiryDate) {
    return { success: false, error: 'File has expired', status: 410 };
  }

  // Check download limit
  if (file.downloadCount >= file.maxDownloads) {
    return { success: false, error: 'Download limit reached', status: 410 };
  }

  // Check password if required
  if (file.passwordHash && !password) {
    return { success: false, error: 'Password required', status: 401 };
  }

  return { success: true };
}

export function validateUserSettings(data: any): { success: boolean; error?: string } {
  const userSettingsSchema = z.object({
    defaultExpiration: z.enum(['1h', '6h', '24h', '7d']),
    defaultMaxDownloads: z.number().min(1).max(100),
    passwordProtectionDefault: z.boolean(),
    twoFactorEnabled: z.boolean(),
    loginNotifications: z.boolean(),
    activityLogs: z.boolean()
  });

  try {
    userSettingsSchema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Invalid user settings data' };
  }
}
