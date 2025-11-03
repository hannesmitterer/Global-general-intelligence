# Gmail OAuth 2.0 Setup Guide

This guide walks you through setting up **Gmail API with OAuth 2.0** for sending emails from the Nexus API or related applications.

---

## Table of Contents

1. [Overview](#overview)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [OAuth 2.0 Configuration](#oauth-20-configuration)
4. [Required Scopes](#required-scopes)
5. [Environment Variables](#environment-variables)
6. [Code Implementation](#code-implementation)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Gmail API allows your application to send emails on behalf of users. OAuth 2.0 ensures secure, delegated access without storing passwords.

### Prerequisites

- Google account
- Access to [Google Cloud Console](https://console.cloud.google.com)
- Node.js application (for implementation examples)

---

## Google Cloud Console Setup

### Step 1: Create a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Nexus API Gmail`
4. Click **"Create"**

### Step 2: Enable Gmail API

1. In the Cloud Console, navigate to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click on **Gmail API** in results
4. Click **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **User Type**:
   - **Internal**: Only for Google Workspace organization users
   - **External**: For any Google account (choose this for general use)
3. Click **"Create"**

#### Consent Screen Configuration

| Field                  | Value                                          |
|------------------------|------------------------------------------------|
| **App name**           | `Nexus API`                                    |
| **User support email** | Your email address                             |
| **App logo**           | (Optional) Upload a logo                       |
| **App domain**         | `https://nexus-api.onrender.com`               |
| **Authorized domains** | `onrender.com`, `netlify.app` (if using these) |
| **Developer contact**  | Your email address                             |

4. Click **"Save and Continue"**

### Step 4: Add Scopes

1. On the **"Scopes"** page, click **"Add or Remove Scopes"**
2. Search and select the following scopes (see [Required Scopes](#required-scopes)):
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.readonly` (optional, for reading emails)
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
3. Click **"Update"** → **"Save and Continue"**

### Step 5: Add Test Users (for External apps)

If you selected **External** user type and app is in testing:

1. On **"Test users"** page, click **"Add Users"**
2. Enter email addresses of users who can test the app
3. Click **"Save and Continue"**

---

## OAuth 2.0 Configuration

### Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Configure as follows:

| Field                      | Value                                              |
|----------------------------|----------------------------------------------------|
| **Application type**       | `Web application`                                  |
| **Name**                   | `Nexus API OAuth Client`                           |
| **Authorized JavaScript origins** | `https://nexus-api.onrender.com`        |
| **Authorized redirect URIs**      | See below                                 |

#### Authorized Redirect URIs

Add the following URIs (adjust domains as needed):

```
https://nexus-api.onrender.com/auth/oauth/callback
https://nexus-api.onrender.com/auth/gmail/callback
http://localhost:8080/auth/oauth/callback
http://localhost:8080/auth/gmail/callback
```

4. Click **"Create"**
5. **Save the Client ID and Client Secret** (you'll need these for environment variables)

---

## Required Scopes

### Gmail Scopes

| Scope                                            | Description                          | Required? |
|--------------------------------------------------|--------------------------------------|-----------|
| `https://www.googleapis.com/auth/gmail.send`     | Send emails on user's behalf         | **Yes**   |
| `https://www.googleapis.com/auth/gmail.readonly` | Read emails (for inbox monitoring)   | Optional  |
| `https://www.googleapis.com/auth/gmail.compose`  | Create drafts                        | Optional  |
| `https://www.googleapis.com/auth/gmail.modify`   | Read and modify emails (not delete)  | Optional  |

### Profile Scopes (for user identification)

| Scope                                                | Description              | Required? |
|------------------------------------------------------|--------------------------|-----------|
| `https://www.googleapis.com/auth/userinfo.email`     | User's email address     | **Yes**   |
| `https://www.googleapis.com/auth/userinfo.profile`   | User's profile info      | **Yes**   |

### Requesting Scopes in OAuth Flow

```javascript
const scopes = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
].join(' ');

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${GOOGLE_CLIENT_ID}&` +
  `redirect_uri=${REDIRECT_URI}&` +
  `response_type=code&` +
  `scope=${encodeURIComponent(scopes)}&` +
  `access_type=offline&` +
  `prompt=consent`;
```

---

## Environment Variables

Add the following to your `.env` file or deployment environment:

```bash
# Gmail OAuth Configuration
GMAIL_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-abc123def456ghi789
GMAIL_REDIRECT_URI=https://nexus-api.onrender.com/auth/gmail/callback

# Optional: Pre-authorized sender email
GMAIL_SENDER_EMAIL=your-email@gmail.com

# Refresh Token (obtained after first OAuth flow)
GMAIL_REFRESH_TOKEN=1//0abc123def456...
```

### Sample `.env` Entry

```bash
# ===== Gmail OAuth Setup =====
GMAIL_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-your-secret-here
GMAIL_REDIRECT_URI=https://nexus-api.onrender.com/auth/gmail/callback
GMAIL_SENDER_EMAIL=notifications@yourdomain.com
GMAIL_REFRESH_TOKEN=
# Note: GMAIL_REFRESH_TOKEN will be populated after first authorization
```

---

## Code Implementation

### Install Dependencies

```bash
npm install googleapis nodemailer
```

### OAuth Flow Implementation

**`src/gmail-auth.ts`**:

```typescript
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

// Generate auth URL
export function getAuthUrl(): string {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' // Force consent to get refresh token
  });
}

// Exchange code for tokens
export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

// Set refresh token
export function setRefreshToken(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
}
```

### Sending Email

**`src/gmail-send.ts`**:

```typescript
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

async function sendEmail(to: string, subject: string, body: string) {
  // Use refresh token to get access token
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });

  const accessToken = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_SENDER_EMAIL,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken.token || ''
    }
  });

  const mailOptions = {
    from: process.env.GMAIL_SENDER_EMAIL,
    to: to,
    subject: subject,
    text: body,
    html: `<p>${body}</p>`
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
}

export default sendEmail;
```

### Express Route for OAuth Callback

**`src/routes/gmail-auth.ts`**:

```typescript
import express from 'express';
import { getAuthUrl, getTokens } from '../gmail-auth';

const router = express.Router();

// Initiate OAuth flow
router.get('/auth/gmail', (req, res) => {
  const authUrl = getAuthUrl();
  res.redirect(authUrl);
});

// OAuth callback
router.get('/auth/gmail/callback', async (req, res) => {
  const code = req.query.code as string;
  
  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  try {
    const tokens = await getTokens(code);
    
    // IMPORTANT: Save refresh token to environment or database
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Add this to your .env file as GMAIL_REFRESH_TOKEN');
    
    res.send('Authorization successful! Check server logs for refresh token.');
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).send('Authorization failed');
  }
});

export default router;
```

---

## Testing

### Step 1: Obtain Refresh Token

1. Start your server: `npm run dev`
2. Navigate to: `http://localhost:8080/auth/gmail`
3. Sign in with Google account
4. Grant permissions
5. Copy the **refresh token** from server logs
6. Add to `.env`: `GMAIL_REFRESH_TOKEN=1//0abc...`

### Step 2: Test Sending Email

Create a test script:

**`test-gmail.ts`**:

```typescript
import sendEmail from './src/gmail-send';

async function test() {
  try {
    const result = await sendEmail(
      'test@example.com',
      'Test Email from Nexus API',
      'This is a test email sent via Gmail OAuth 2.0'
    );
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

test();
```

Run the test:

```bash
npx ts-node test-gmail.ts
```

### Step 3: Verify in Gmail

1. Check the recipient's inbox (may be in spam initially)
2. Verify sender shows as your authorized email

---

## Troubleshooting

### Error: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not configured properly

**Solution:**
1. Go to OAuth consent screen in Google Console
2. Ensure all required fields are filled
3. Verify authorized domains are correct

### Error: "invalid_grant" when exchanging code

**Cause:** Authorization code already used or expired

**Solution:**
- Codes are single-use and expire in 10 minutes
- Generate a new authorization URL and try again

### Error: "insufficient permissions"

**Cause:** Missing required scopes

**Solution:**
- Verify `gmail.send` scope is requested in OAuth flow
- Revoke access in Google Account → Security → Third-party apps
- Re-authorize with correct scopes

### Error: "invalid_client"

**Cause:** Client ID or Secret mismatch

**Solution:**
- Double-check `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET`
- Ensure redirect URI matches exactly (including http/https)

### Emails going to spam

**Solution:**
1. **SPF**: Add SPF record to your domain DNS:
   ```
   v=spf1 include:_spf.google.com ~all
   ```
2. **DKIM**: Enable DKIM in Google Workspace (if using custom domain)
3. **From Address**: Use a verified domain email as sender

### Refresh token not returned

**Cause:** User previously authorized the app

**Solution:**
- Add `prompt=consent` to force re-authorization
- Or revoke access and re-authorize

---

## Security Best Practices

1. **Never commit secrets**: Use environment variables, never hardcode
2. **Rotate credentials**: Periodically regenerate client secret
3. **Limit scopes**: Only request scopes you need
4. **Secure storage**: Store refresh tokens encrypted in database
5. **HTTPS only**: Never use OAuth over HTTP in production
6. **Validate redirect URIs**: Only whitelist your own domains

---

## Rate Limits

Gmail API has the following quotas:

| Operation     | Quota                | Reset Period |
|---------------|----------------------|--------------|
| **Send**      | 100 emails/second    | Per second   |
| **Daily**     | 2,000,000,000 quota  | Per day      |

For higher limits, request a quota increase in Google Console.

---

## Additional Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
- [Google Console](https://console.cloud.google.com)
- [Nodemailer OAuth2](https://nodemailer.com/smtp/oauth2/)

---

**Need help?** Open an issue: https://github.com/hannesmitterer/Global-general-intelligence/issues
