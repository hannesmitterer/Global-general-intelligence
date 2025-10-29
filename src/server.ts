import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import * as hopeKpi from './kpi/hope';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// CORS setup
const corsOrigin = process.env.CORS_ALLOW_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

const ingestLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit to 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

// Google OAuth client
const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const googleIssuers = (process.env.GOOGLE_ISSUERS || 'accounts.google.com,https://accounts.google.com').split(',');
const oauthClient = new OAuth2Client(googleClientId);

// Allowlists
const seedbringerEmails = (process.env.SEEDBRINGER_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
const councilEmails = (process.env.COUNCIL_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

// Helper: verify ID token and extract email
async function verifyIdToken(token: string): Promise<{ email: string; role: string } | null> {
  try {
    const ticket = await oauthClient.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return null;
    
    const email = payload.email;
    const issuer = payload.iss;
    
    // Verify issuer
    if (!googleIssuers.includes(issuer)) return null;
    
    // Determine role
    let role = 'unauthorized';
    if (seedbringerEmails.includes(email)) {
      role = 'seedbringer';
    } else if (councilEmails.includes(email)) {
      role = 'council';
    }
    
    return { email, role };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Middleware: require Council (Seedbringer or Council)
async function requireCouncil(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  
  const token = authHeader.substring(7);
  const verified = await verifyIdToken(token);
  
  if (!verified || (verified.role !== 'seedbringer' && verified.role !== 'council')) {
    return res.status(403).json({ error: 'Access denied. Council authorization required.' });
  }
  
  (req as any).principal = verified.email;
  (req as any).role = verified.role;
  next();
}

// Middleware: require Seedbringer
async function requireSeedbringer(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  
  const token = authHeader.substring(7);
  const verified = await verifyIdToken(token);
  
  if (!verified || verified.role !== 'seedbringer') {
    return res.status(403).json({ error: 'Access denied. Seedbringer authorization required.' });
  }
  
  (req as any).principal = verified.email;
  (req as any).role = verified.role;
  next();
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ALO-001 Endpoint: GET /sfi (Council required)
app.get('/sfi', authLimiter, requireCouncil, (req: Request, res: Response) => {
  const principal = (req as any).principal;
  const role = (req as any).role;
  res.json({
    principal,
    role,
    sfi: 'Strategic Forecast Indicator data (placeholder)',
    timestamp: new Date().toISOString(),
  });
});

// ALO-001 Endpoint: GET /mcl/live (Council required)
app.get('/mcl/live', authLimiter, requireCouncil, (req: Request, res: Response) => {
  const principal = (req as any).principal;
  const role = (req as any).role;
  res.json({
    principal,
    role,
    mcl: 'Mission-Critical Levels live data (placeholder)',
    timestamp: new Date().toISOString(),
  });
});

// ALO-001 Endpoint: POST /allocations (Seedbringer required)
app.post('/allocations', authLimiter, requireSeedbringer, (req: Request, res: Response) => {
  const principal = (req as any).principal;
  const role = (req as any).role;
  const { op } = req.body;
  res.json({
    actor: principal,
    role,
    operation: op || 'unknown',
    status: 'allocation accepted (placeholder)',
    timestamp: new Date().toISOString(),
  });
});

// Seed-003 Endpoint: GET /kpi/hope-ratio (Council required)
app.get('/kpi/hope-ratio', authLimiter, requireCouncil, (req: Request, res: Response) => {
  const kpi = hopeKpi.getRollingKpi();
  res.json({ kpi });
});

// Seed-003 Endpoint: POST /ingest/sentimento (unauthenticated in this PR)
app.post('/ingest/sentimento', ingestLimiter, (req: Request, res: Response) => {
  const { sorrow, hope } = req.body;
  
  if (typeof sorrow !== 'number' || typeof hope !== 'number') {
    return res.status(400).json({ error: 'sorrow and hope must be numbers' });
  }
  
  if (sorrow < 0 || sorrow > 1 || hope < 0 || hope > 1) {
    return res.status(400).json({ error: 'sorrow and hope must be in [0,1]' });
  }
  
  hopeKpi.pushSample(sorrow, hope);
  res.json({ status: 'sample ingested', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS origin: ${corsOrigin}`);
});
