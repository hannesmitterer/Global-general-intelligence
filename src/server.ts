import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { config, validateConfig } from './config';
import {
  verifyGoogleToken,
  requireSeedbringer,
  requireCouncilOrSeedbringer,
  AuthenticatedRequest
} from './middleware/googleAuth';
import { SentimentoWSHub } from './ws/sentimento';
import { SentimentoLiveEvent } from './types/sentimento';
import { seed003KPI } from './kpi/seed003';
import { getWalletConfig, isWalletFullyConfigured, getPendingConfigItems } from './config/wallet';

// Validate configuration at startup
try {
  validateConfig();
  console.log('Configuration validated successfully');
} catch (error) {
  console.error('Configuration error:', error);
  process.exit(1);
}

const app = express();

// Initialize SentimentoWSHub
const sentimentoHub = new SentimentoWSHub({
  broadcastHz: config.sentimentoBroadcastHz,
  bufferMaxKb: config.sentimentoBufferMaxKb
});

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later.'
});

// Stricter rate limiting for write operations
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many write requests from this IP, please try again later.'
});

// Middleware
// CORS configuration
app.use(cors({
  origin: config.corsAllowOrigin === '*' ? true : config.corsAllowOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint (public)
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected endpoints

/**
 * GET /sfi - Retrieve SFI data
 * Accessible by: Council or Seedbringer
 */
app.get('/sfi', limiter, verifyGoogleToken, requireCouncilOrSeedbringer, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    data: 'SFI data',
    message: 'SFI data retrieved successfully',
    user: req.user?.email,
    role: req.user?.role
  });
});

/**
 * GET /mcl/live - Retrieve MCL live data
 * Accessible by: Council or Seedbringer
 */
app.get('/mcl/live', limiter, verifyGoogleToken, requireCouncilOrSeedbringer, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    data: 'MCL live data',
    message: 'MCL live data retrieved successfully',
    user: req.user?.email,
    role: req.user?.role
  });
});

/**
 * POST /allocations - Create new allocation
 * Accessible by: Seedbringer only
 */
app.post('/allocations', strictLimiter, verifyGoogleToken, requireSeedbringer, (req: AuthenticatedRequest, res: Response) => {
  const allocationData = req.body;
  
  res.json({
    message: 'Allocation created successfully',
    user: req.user?.email,
    role: req.user?.role,
    allocation: allocationData
  });
});

/**
 * GET /kpi/hope-ratio - Retrieve Seed-003 hope-ratio KPI
 * Accessible by: Council or Seedbringer
 */
app.get('/kpi/hope-ratio', limiter, verifyGoogleToken, requireCouncilOrSeedbringer, (req: AuthenticatedRequest, res: Response) => {
  const stats = seed003KPI.getStats();
  res.json({
    hopeRatio: stats.hopeRatio,
    sampleCount: stats.sampleCount,
    avgHope: stats.avgHope,
    avgSorrow: stats.avgSorrow,
    user: req.user?.email,
    role: req.user?.role
  });
});

/**
 * POST /ingest/sentimento - Ingest sentimento data and broadcast to WebSocket clients
 * Scaffold endpoint - currently unauthenticated (can be gated later)
 */
app.post('/ingest/sentimento', strictLimiter, (req: Request, res: Response) => {
  try {
    const { composites, metadata } = req.body;

    // Validate composites
    if (!composites || typeof composites.hope !== 'number' || typeof composites.sorrow !== 'number') {
      res.status(400).json({ error: 'Invalid payload: composites.hope and composites.sorrow are required' });
      return;
    }

    // Create event
    const event: SentimentoLiveEvent = {
      composites: {
        hope: composites.hope,
        sorrow: composites.sorrow
      },
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    };

    // Broadcast to all WebSocket clients
    sentimentoHub.broadcast(event);

    res.json({
      message: 'Sentimento data ingested and broadcasted',
      clientCount: sentimentoHub.getClientCount(),
      event
    });
  } catch (error) {
    console.error('Error ingesting sentimento data:', error);
    res.status(500).json({ error: 'Failed to ingest sentimento data' });
  }
});

/**
 * GET /wallet/config - Retrieve consolidated wallet configuration
 * Accessible by: Council or Seedbringer
 */
app.get('/wallet/config', limiter, verifyGoogleToken, requireCouncilOrSeedbringer, (req: AuthenticatedRequest, res: Response) => {
  const walletConfig = getWalletConfig();
  const isFullyConfigured = isWalletFullyConfigured();
  const pendingItems = getPendingConfigItems();

  res.json({
    ...walletConfig,
    _metadata: {
      isFullyConfigured,
      pendingConfigItems: pendingItems,
      user: req.user?.email,
      role: req.user?.role
    }
  });
});


// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Create HTTP server from Express app
const httpServer = createServer(app);

// Attach SentimentoWSHub to the HTTP server
sentimentoHub.attach(httpServer, '/api/v2/sentimento/live');

// Start server
httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`CORS allow origin: ${config.corsAllowOrigin}`);
  console.log(`Seedbringer emails: ${config.seedbringerEmails.join(', ')}`);
  console.log(`Council emails: ${config.councilEmails.join(', ')}`);
  console.log(`WebSocket endpoint: ws://localhost:${config.port}/api/v2/sentimento/live`);
});

export default app;
