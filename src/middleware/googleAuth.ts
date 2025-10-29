import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';

const client = new OAuth2Client(config.googleClientId);

export interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    name?: string;
    picture?: string;
    sub: string;
  };
}

/**
 * Middleware to verify Google ID token from Authorization header
 */
export async function verifyGoogleToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    // Verify issuer
    if (config.googleIssuers.length > 0 && !config.googleIssuers.includes(payload.iss)) {
      res.status(401).json({ error: 'Invalid token issuer' });
      return;
    }

    // Store user info in request
    req.user = {
      email: payload.email || '',
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Middleware to require user to be in seedbringer allowlist
 */
export function requireSeedbringer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userEmail = req.user.email.toLowerCase();
  const allowedEmails = config.seedbringerEmails.map(e => e.toLowerCase());

  if (!allowedEmails.includes(userEmail)) {
    console.log(`Access denied for user: ${req.user.email} - Seedbringer role required`);
    res.status(403).json({ 
      error: 'Forbidden: Seedbringer role required'
    });
    return;
  }

  next();
}

/**
 * Middleware to require user to be in council allowlist
 */
export function requireCouncil(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userEmail = req.user.email.toLowerCase();
  const allowedEmails = config.councilEmails.map(e => e.toLowerCase());

  if (!allowedEmails.includes(userEmail)) {
    console.log(`Access denied for user: ${req.user.email} - Council role required`);
    res.status(403).json({ 
      error: 'Forbidden: Council role required'
    });
    return;
  }

  next();
}
