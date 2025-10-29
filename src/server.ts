import express, { Request, Response } from 'express';
import cors from 'cors';
import { config, validateConfig } from './config';
import {
  verifyGoogleToken,
  requireSeedbringer,
  requireCouncilOrSeedbringer,
  AuthenticatedRequest
} from './middleware/googleAuth';

// Validate configuration at startup
try {
  validateConfig();
  console.log('Configuration validated successfully');
} catch (error) {
  console.error('Configuration error:', error);
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors({
  origin: config.corsAllowOrigin
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
app.get('/sfi', verifyGoogleToken, requireCouncilOrSeedbringer, (req: AuthenticatedRequest, res: Response) => {
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
app.get('/mcl/live', verifyGoogleToken, requireCouncilOrSeedbringer, (req: AuthenticatedRequest, res: Response) => {
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
app.post('/allocations', verifyGoogleToken, requireSeedbringer, (req: AuthenticatedRequest, res: Response) => {
  const allocationData = req.body;
  
  res.json({
    message: 'Allocation created successfully',
    user: req.user?.email,
    role: req.user?.role,
    allocation: allocationData
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`CORS allow origin: ${config.corsAllowOrigin}`);
  console.log(`Seedbringer emails: ${config.seedbringerEmails.join(', ')}`);
  console.log(`Council emails: ${config.councilEmails.join(', ')}`);
});

export default app;
