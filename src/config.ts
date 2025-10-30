import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleIssuers: (process.env.GOOGLE_ISSUERS || 'accounts.google.com,https://accounts.google.com').split(','),
  seedbringerEmails: (process.env.SEEDBRINGER_EMAILS || '').split(',').map(e => e.trim()),
  councilEmails: (process.env.COUNCIL_EMAILS || '').split(',').map(e => e.trim()),
  requiredScopesSeedbringer: (process.env.REQUIRED_SCOPES_SEEDBRINGER || '').split(' ').filter(s => s),
  requiredScopesCouncil: (process.env.REQUIRED_SCOPES_COUNCIL || '').split(' ').filter(s => s),
  corsAllowOrigin: process.env.CORS_ALLOW_ORIGIN || '*',
  sentimentoBroadcastHz: parseInt(process.env.SENTIMENTO_BROADCAST_HZ || '10', 10),
  sentimentoBufferMaxKb: parseInt(process.env.SENTIMENTO_BUFFER_MAX_KB || '512', 10)
};

export function validateConfig(): void {
  if (!config.googleClientId) {
    throw new Error('GOOGLE_CLIENT_ID is required');
  }
  if (config.seedbringerEmails.length === 0 || config.seedbringerEmails[0] === '') {
    throw new Error('SEEDBRINGER_EMAILS is required');
  }
  if (config.councilEmails.length === 0 || config.councilEmails[0] === '') {
    throw new Error('COUNCIL_EMAILS is required');
  }
}
