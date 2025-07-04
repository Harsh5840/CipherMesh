import { storage } from "../storage";
import fs from "fs";
import path from "path";

class FileService {
  async cleanupExpiredFiles(): Promise<void> {
    try {
      const expiredFiles = await storage.getExpiredFiles();
      
      for (const file of expiredFiles) {
        // Delete file from disk
        if (fs.existsSync(file.encryptedPath)) {
          fs.unlinkSync(file.encryptedPath);
        }
        
        // Mark as expired in database
        await storage.updateFile(file.id, { isExpired: true });
      }
      
      console.log(`Cleaned up ${expiredFiles.length} expired files`);
    } catch (error) {
      console.error('Error cleaning up expired files:', error);
    }
  }

  async getFileStats(userId: string): Promise<{
    totalFiles: number;
    totalDownloads: number;
    totalSize: number;
    activeFiles: number;
  }> {
    try {
      const files = await storage.getFilesByUser(userId);
      
      const stats = files.reduce((acc, file) => {
        acc.totalFiles++;
        acc.totalDownloads += file.downloadCount;
        acc.totalSize += file.fileSize;
        
        if (!file.isExpired && new Date() < file.expiryDate) {
          acc.activeFiles++;
        }
        
        return acc;
      }, {
        totalFiles: 0,
        totalDownloads: 0,
        totalSize: 0,
        activeFiles: 0
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting file stats:', error);
      throw error;
    }
  }

  async validateFileAccess(fileId: string, password?: string): Promise<{
    success: boolean;
    error?: string;
    status?: number;
  }> {
    try {
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return { success: false, error: 'File not found', status: 404 };
      }

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
    } catch (error) {
      console.error('Error validating file access:', error);
      return { success: false, error: 'Validation failed', status: 500 };
    }
  }
}

export const fileService = new FileService();
