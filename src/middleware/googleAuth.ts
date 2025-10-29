import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';

const client = new OAuth2Client(config.googleClientId);

export type UserRole = 'seedbringer' | 'council' | 'none';

export interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    role: UserRole;
  };
}

/**
 * Verify Google ID token and attach user info to request
 */
export async function verifyGoogleToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    // Check issuer
    if (payload.iss && !config.googleIssuers.includes(payload.iss)) {
      res.status(401).json({ error: 'Invalid token issuer' });
      return;
    }

    // Determine user role
    const email = payload.email;
    let role: UserRole = 'none';

    if (config.seedbringerEmails.includes(email)) {
      role = 'seedbringer';
    } else if (config.councilEmails.includes(email)) {
      role = 'council';
    }

    if (role === 'none') {
      res.status(403).json({ error: 'User not authorized' });
      return;
    }

    // Attach user info to request
    req.user = { email, role };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware to require seedbringer role
 */
export function requireSeedbringer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  if (req.user.role !== 'seedbringer') {
    res.status(403).json({ error: 'Seedbringer role required' });
    return;
  }

  next();
}

/**
 * Middleware to require council or seedbringer role
 */
export function requireCouncilOrSeedbringer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  if (req.user.role !== 'council' && req.user.role !== 'seedbringer') {
    res.status(403).json({ error: 'Council or Seedbringer role required' });
    return;
  }

  next();
}
