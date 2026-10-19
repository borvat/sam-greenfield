# SAM built-in OAuth for ChatGPT

SAM MCP now includes its own OAuth authorization server. ChatGPT connects to
the MCP endpoint directly; no separate OAuth provider or identity service is
needed. OAuth is disabled by default, and the existing bearer-token setup
continues to work until an operator switches the service to OAuth.

## Configure the service

Set these variables in the MCP service's secret environment configuration:

- `SAM_MCP_INTERNAL_OAUTH_ENABLED=1`
- `SAM_MCP_PUBLIC_RESOURCE_URL=https://<public-host>/mcp`
- `SAM_MCP_OAUTH_OWNER_EMAIL=<owner-login-email>`
- `SAM_MCP_OAUTH_OWNER_PASSWORD_HASH=<scrypt-hash>`
- `SAM_MCP_OAUTH_SIGNING_PRIVATE_KEY=<RSA-private-key-PEM>`

Generate a unique password of at least 16 characters and hash it locally with
`npm run mcp:password-hash`. Password input is hidden and only the hash is
printed. Generate a 3072-bit RSA signing key locally with:

```sh
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072
```

Store the password hash and private key only in the hosting provider's secret
settings. Do not commit or share them. Remove `SAM_MCP_BEARER_TOKEN` when
switching to OAuth; the service refuses to start if both modes are configured.
The OAuth setting stays disabled until all values are present and valid.

## Connect ChatGPT

After deploying the reviewed change and configuring the service, add a custom
MCP server in ChatGPT using `https://<public-host>/mcp`. Select OAuth if asked
for an authentication method, then sign in with the owner email and password.
The consent page explains that the connection grants access to the SAM tools
exposed by the service, including available actions that may change data.

OAuth authorizes access to MCP. It does not configure SAM's provider API keys or
make unavailable production capabilities work. Test the connection and the
needed SAM actions in ChatGPT after the service starts successfully.
