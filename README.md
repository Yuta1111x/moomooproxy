# MooMoo.io WebSocket Proxy

Proxy server for MooMoo.io bots to bypass IP limits.

## Usage

Connect via WebSocket:
```
wss://YOUR-RAILWAY-URL.railway.app/?target=wss://ipX.moomoo.io:PORT/token=TOKEN
```

## Deploy to Railway

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Init project: `railway init`
4. Deploy: `railway up`

## Local Development

```bash
npm install
npm start
```

Server runs on port 3000 by default.
