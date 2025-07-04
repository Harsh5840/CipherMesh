import { Request, Response, NextFunction } from "express";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // Continue regardless of authentication status
  next();
};
