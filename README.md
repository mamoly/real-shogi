# Shogi App Cloudflare Skeleton

This directory contains the minimum Cloudflare setup for the custom shogi app.

## Stack

- Cloudflare Workers
- Durable Objects
- D1

## Local setup

1. Set environment variables in PowerShell.

```powershell
[System.Environment]::SetEnvironmentVariable("CLOUDFLARE_API_TOKEN", "YOUR_TOKEN", "User")
[System.Environment]::SetEnvironmentVariable("CLOUDFLARE_ACCOUNT_ID", "YOUR_ACCOUNT_ID", "User")
```

2. Open a new PowerShell window and install dependencies.

```powershell
& "C:\Program Files\nodejs\npm.cmd" install
```

3. Create the D1 database.

```powershell
& "C:\Program Files\nodejs\npx.cmd" wrangler d1 create shogi-app
```

4. Copy the returned `database_id` into `wrangler.jsonc`.

5. Apply the first migration.

```powershell
& "C:\Program Files\nodejs\npx.cmd" wrangler d1 migrations apply shogi-app
```

6. Open the Cloudflare Workers dashboard once and let Cloudflare create your `workers.dev` subdomain if this is your first Worker.

7. Start local development.

```powershell
& "C:\Program Files\nodejs\npm.cmd" run dev
```

8. Deploy.

```powershell
& "C:\Program Files\nodejs\npm.cmd" run deploy
```

## Current routes

- `GET /`
- `GET /app.js`
- `GET /app.css`
- `GET /health`
- `POST /api/rooms`
- `GET /api/rooms/:roomId`
- `GET /api/rooms/:roomId/legal-moves`
- `POST /api/rooms/:roomId/move`
- `GET /api/rooms/:roomId/ws`

## Notes

- The Worker is authoritative for room creation and room state.
- Durable Objects should own hidden information and probability resolution.
- The current UI supports room creation, invite link generation, room lookup, WebSocket join flow, initial shogi board display, and one normal move.
- D1 persistence is scaffolded but not wired into gameplay yet.
