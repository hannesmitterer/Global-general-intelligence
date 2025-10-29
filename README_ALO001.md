# ALO-001: Google OAuth Backend Enforcement

This implementation provides Google OAuth ID token verification for backend endpoints with role-based access control.

## Architecture

### Backend Components
- **Express Server** (`src/server.ts`): REST API with protected endpoints
- **Google Auth Middleware** (`src/middleware/googleAuth.ts`): ID token verification and role checking
- **Configuration** (`src/config.ts`): Environment-based configuration management

### Protected Endpoints
- `GET /sfi` - Strategic Framework Interface (Council role required)
- `GET /mcl/live` - Management Control Layer Live (Council role required)
- `POST /allocations` - Resource allocations (Seedbringer role required)

### Frontend
- **PBL-001 Interface** (`public/pbl-001/index.html`): Google Sign-In integration with Bearer token authentication

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (copy `.env.example` to `.env`):
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your Google OAuth Client ID:
   - Create OAuth credentials at https://console.cloud.google.com/apis/credentials
   - Add your client ID to `GOOGLE_CLIENT_ID`
   - Configure authorized JavaScript origins and redirect URIs

4. Update `public/pbl-001/index.html`:
   - Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google OAuth Client ID

5. Build the TypeScript code:
   ```bash
   npm run build
   ```

6. Start the server:
   ```bash
   npm start
   ```

## Security Considerations

### Implemented
✅ Google ID token verification  
✅ Role-based access control via email allowlists  
✅ CORS configuration via environment variable  
✅ Input validation for configuration  
✅ Privacy-preserving error messages (no email exposure in responses)

### Recommended Enhancements
⚠️ **Rate Limiting**: Add rate limiting middleware (e.g., `express-rate-limit`) to prevent DoS attacks  
⚠️ **CORS Configuration**: In production, set `CORS_ALLOW_ORIGIN` to specific trusted domains instead of `*`  
⚠️ **HTTPS**: Always use HTTPS in production  
⚠️ **Session Management**: Consider adding session management for better security  
⚠️ **Audit Logging**: Implement comprehensive audit logging for access attempts

### CORS Configuration
The `CORS_ALLOW_ORIGIN` environment variable is intentionally configurable:
- For development: Use `*` for flexibility
- For production: Set to your specific frontend domain(s)

Example production configuration:
```env
CORS_ALLOW_ORIGIN=https://yourdomain.com
```

## Testing

The frontend can be tested by:
1. Opening `public/pbl-001/index.html` in a web browser
2. Signing in with Google
3. Testing the protected endpoints (user must be in the appropriate allowlist)

## CI/CD

The `.github/workflows/alo-001-ci.yml` workflow:
- Builds TypeScript code
- Verifies `.env.example` exists with required variables
- Runs tests

## Configuration Reference

See `.env.example` for all available configuration options.
