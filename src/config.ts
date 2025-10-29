import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  googleClientId: string;
  googleIssuers: string[];
  seedbringerEmails: string[];
  councilEmails: string[];
  // Note: Scope validation is configured but not yet implemented in middleware
  // These are reserved for future OAuth access token verification
  requiredScopesSeedbringer: string[];
  requiredScopesCouncil: string[];
  corsAllowOrigin: string;
  port: number;
}

function parseEmailList(envVar: string | undefined, defaultValue: string = ''): string[] {
  const value = envVar || defaultValue;
  return value
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
}

function parseScopeList(envVar: string | undefined, defaultValue: string = ''): string[] {
  const value = envVar || defaultValue;
  return value
    .split(/\s+/)
    .map(scope => scope.trim())
    .filter(scope => scope.length > 0);
}

export const config: Config = {
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleIssuers: parseEmailList(process.env.GOOGLE_ISSUERS, 'accounts.google.com,https://accounts.google.com'),
  seedbringerEmails: parseEmailList(process.env.SEEDBRINGER_EMAILS),
  councilEmails: parseEmailList(process.env.COUNCIL_EMAILS),
  requiredScopesSeedbringer: parseScopeList(process.env.REQUIRED_SCOPES_SEEDBRINGER),
  requiredScopesCouncil: parseScopeList(process.env.REQUIRED_SCOPES_COUNCIL),
  corsAllowOrigin: process.env.CORS_ALLOW_ORIGIN || '*',
  port: parseInt(process.env.PORT || '8080', 10),
};

// Validate required config
if (!config.googleClientId) {
  console.error('ERROR: GOOGLE_CLIENT_ID is required in .env file');
  process.exit(1);
}
