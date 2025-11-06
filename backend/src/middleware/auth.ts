import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';

export interface AuthenticatedRequest extends Request {
  userUid?: string;
  userClaims?: Record<string, unknown>;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  const token = authorization.replace('Bearer ', '').trim();

  try {
    const decoded = await firebaseAuth().verifyIdToken(token, true);
    req.userUid = decoded.uid;
    req.userClaims = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function adminOnly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.userClaims?.['admin'] === true) {
    return next();
  }

  return res.status(403).json({ message: 'Admin privileges required' });
}
