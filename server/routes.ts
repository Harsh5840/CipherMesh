import type { Express } from "express";
import { createServer, type Server } from "http";
import { fileController } from "./controllers/fileController";
import { authController } from "./controllers/authController";
import { uploadMiddleware } from "./middleware/upload";
import { rateLimitMiddleware } from "./middleware/rateLimit";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes (no authentication middleware)
  app.get('/api/auth/user', (req: any, res) => authController.getUser(req, res));
  app.put('/api/auth/user', (req: any, res) => authController.updateUser(req, res));
  app.get('/api/auth/settings', (req: any, res) => authController.getUserSettings(req, res));
  app.put('/api/auth/settings', (req: any, res) => authController.updateUserSettings(req, res));

  // File routes (no authentication middleware)
  app.post('/api/files/upload', 
    rateLimitMiddleware.upload, 
    uploadMiddleware.single('file'), 
    (req: any, res) => fileController.upload(req, res)
  );
  
  app.get('/api/files/download/:id', 
    rateLimitMiddleware.download, 
    (req: any, res) => fileController.download(req, res)
  );
  
  app.get('/api/files/info/:id', (req: any, res) => fileController.getFileInfo(req, res));
  app.get('/api/files', (req: any, res) => fileController.getUserFiles(req, res));
  app.delete('/api/files/:id', (req: any, res) => fileController.deleteFile(req, res));
  app.get('/api/files/:id/logs', (req: any, res) => fileController.getFileLogs(req, res));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
