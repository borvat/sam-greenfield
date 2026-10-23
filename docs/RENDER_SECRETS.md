# Google OAuth secrets for SAM on Render

This guide describes configuration only. Do not commit credentials, tokens, or real secret values to GitHub.

## Prerequisites
1. Create or select a Google Cloud OAuth client for the authorized company Google account.
2. Enable only the Google APIs required for the read-only trial (Gmail API and Google Drive API).
3. Configure OAuth consent and obtain a refresh token through an authorized OAuth flow with read-only scopes. Do not paste the refresh token into issues, chat, or source files.
4. Confirm the exact OAuth scopes and required variables against the SAM production adapters before granting access.

## Configure existing Render services
1. Open the Render Dashboard and select the workspace containing SAM.
2. Open **sam-runtime** > **Environment**.
3. Add these three environment variables using actual credentials from the approved Google OAuth client:
   - `GOOGLE_OAUTH_CLIENT_ID`
   - `GOOGLE_OAUTH_CLIENT_SECRET`
   - `GOOGLE_OAUTH_REFRESH_TOKEN`
4. Repeat for **sam-mcp** if its production composition loads the same Google adapter. Verify that service's need before exposing credentials.
5. Save using Render's secure environment controls. Do not copy secrets into `render.yaml`, logs, or a pull request.
6. Redeploy only after reviewing the environment and receiving authorization for a production change.

Render Blueprint `sync: false` entries can prompt for values when creating a service, but may not prompt again for an already-created service. For existing services, enter secrets manually under Environment.

## Acceptance checks
- Confirm the actual deployment and application logs in Render.
- Check `sam-runtime /readyz` and `sam-mcp /livez`.
- Perform an authorized read-only Gmail or Drive operation, then independently verify the returned result.
- Run the project's live acceptance checks against the deployed endpoints.
- Treat HTTP 200 with placeholder credentials as **boot-only evidence**, not proof of working Google OAuth.
- Record evidence and redact tokens and personal information.

Do not use placeholder credentials in production.
