import { Request, Response } from "express";
import { storage } from "../storage";
import { fileService } from "../services/fileService";
import { cryptoService } from "../services/cryptoService";
import { validateFileUpload, validateFileAccess } from "../utils/validation";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";

interface AuthenticatedRequest extends Request {
  user?: any; // Replit Auth user object
}

class FileController {
  async upload(req: AuthenticatedRequest, res: Response) {
    try {
      const { originalName, fileSize, mimeType, publicKey, iv, maxDownloads = 1, expiryHours = 24, password } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Validate file upload
      const validation = validateFileUpload({
        originalName,
        fileSize: parseInt(fileSize),
        mimeType,
        publicKey,
        iv,
        maxDownloads: parseInt(maxDownloads),
        expiryHours: parseInt(expiryHours)
      });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const userId = req.user?.claims.sub;
      const fileId = nanoid();
      const expiryDate = new Date(Date.now() + parseInt(expiryHours) * 60 * 60 * 1000);

      // Hash password if provided
      let passwordHash = null;
      if (password) {
        passwordHash = await cryptoService.hashPassword(password);
      }

      const fileRecord = await storage.createFile({
        id: fileId,
        userId,
        filename: req.file.filename,
        originalName,
        fileSize: parseInt(fileSize),
        mimeType,
        encryptedPath: req.file.path,
        publicKey,
        iv,
        expiryDate,
        maxDownloads: parseInt(maxDownloads),
        passwordHash
      });

      // Log the upload
      await storage.createFileAccessLog({
        id: nanoid(),
        fileId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        accessType: 'upload'
      });

      res.json({
        success: true,
        fileId: fileRecord.id,
        expiryDate: fileRecord.expiryDate,
        downloadUrl: `${req.protocol}://${req.get('host')}/download/${fileRecord.id}`,
        shareUrl: `${req.protocol}://${req.get('host')}/share/${fileRecord.id}`
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }

  async download(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { password } = req.body;

      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Validate file access
      const validation = validateFileAccess(file, password);
      if (!validation.success) {
        return res.status(validation.status).json({ error: validation.error });
      }

      // Check if file exists on disk
      if (!fs.existsSync(file.encryptedPath)) {
        return res.status(404).json({ error: 'File not found on disk' });
      }

      // Update download count
      await storage.updateFile(id, { downloadCount: file.downloadCount + 1 });

      // Log the download
      await storage.createFileAccessLog({
        id: nanoid(),
        fileId: id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        accessType: 'download'
      });

      // Send encrypted file data
      const encryptedData = fs.readFileSync(file.encryptedPath);
      
      res.json({
        success: true,
        file: {
          id: file.id,
          originalName: file.originalName,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
          publicKey: file.publicKey,
          iv: file.iv,
          downloadCount: file.downloadCount + 1,
          maxDownloads: file.maxDownloads
        },
        encryptedData: encryptedData.toString('base64')
      });
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: 'Download failed' });
    }
  }

  async getFileInfo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Log the info access
      await storage.createFileAccessLog({
        id: nanoid(),
        fileId: id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        accessType: 'view'
      });

      res.json({
        success: true,
        file: {
          id: file.id,
          originalName: file.originalName,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
          uploadDate: file.uploadDate,
          expiryDate: file.expiryDate,
          downloadCount: file.downloadCount,
          maxDownloads: file.maxDownloads,
          isExpired: file.isExpired || new Date() > file.expiryDate,
          requiresPassword: !!file.passwordHash
        }
      });
    } catch (error) {
      console.error('Info error:', error);
      res.status(500).json({ error: 'Failed to get file info' });
    }
  }

  async getUserFiles(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.claims.sub;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const files = await storage.getFilesByUser(userId);
      
      res.json({
        success: true,
        files: files.map(file => ({
          id: file.id,
          originalName: file.originalName,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
          uploadDate: file.uploadDate,
          expiryDate: file.expiryDate,
          downloadCount: file.downloadCount,
          maxDownloads: file.maxDownloads,
          isExpired: file.isExpired || new Date() > file.expiryDate,
          requiresPassword: !!file.passwordHash
        }))
      });
    } catch (error) {
      console.error('Get user files error:', error);
      res.status(500).json({ error: 'Failed to get user files' });
    }
  }

  async deleteFile(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.claims.sub;

      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (file.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Delete file from disk
      if (fs.existsSync(file.encryptedPath)) {
        fs.unlinkSync(file.encryptedPath);
      }

      // Delete from database
      await storage.deleteFile(id);

      res.json({ success: true });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  }

  async getFileLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.claims.sub;

      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (file.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const logs = await storage.getFileAccessLogs(id);
      
      res.json({
        success: true,
        logs: logs.map(log => ({
          id: log.id,
          accessType: log.accessType,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          accessedAt: log.accessedAt
        }))
      });
    } catch (error) {
      console.error('Get file logs error:', error);
      res.status(500).json({ error: 'Failed to get file logs' });
    }
  }
}

export const fileController = new FileController();
