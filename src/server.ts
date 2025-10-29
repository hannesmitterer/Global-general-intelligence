import express from 'express';
import cors from 'cors';
import { config } from './config';
import { 
  verifyGoogleToken, 
  requireCouncil, 
  requireSeedbringer,
  AuthenticatedRequest 
} from './middleware/googleAuth';

const app = express();

// Middleware
app.use(cors({
  origin: config.corsAllowOrigin,
  credentials: true,
}));
app.use(express.json());

// Public route - health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected route: GET /sfi - requires council role
app.get('/sfi', verifyGoogleToken, requireCouncil, (req: AuthenticatedRequest, res) => {
  res.json({
    message: 'SFI endpoint',
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// Protected route: GET /mcl/live - requires council role
app.get('/mcl/live', verifyGoogleToken, requireCouncil, (req: AuthenticatedRequest, res) => {
  res.json({
    message: 'MCL Live endpoint',
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// Protected route: POST /allocations - requires seedbringer role
app.post('/allocations', verifyGoogleToken, requireSeedbringer, (req: AuthenticatedRequest, res) => {
  const allocationData = req.body;
  
  res.json({
    message: 'Allocation created',
    user: req.user,
    data: allocationData,
    timestamp: new Date().toISOString(),
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS origin: ${config.corsAllowOrigin}`);
  console.log(`Google Client ID: ${config.googleClientId}`);
  console.log(`Seedbringer emails: ${config.seedbringerEmails.length} configured`);
  console.log(`Council emails: ${config.councilEmails.length} configured`);
});

export default app;
