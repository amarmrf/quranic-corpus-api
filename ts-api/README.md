# Quranic Corpus API (TypeScript)

This is the TypeScript/Fastify port of the Quranic Corpus API.

## Local Development

```bash
npm ci
npm run dev
```

The service runs on port `6382` by default.

## Build

```bash
npm run build
```

Build output is written to `dist/` and corpus resources are copied to `resources/`.

## Test

```bash
npm test
```

## Production Run

After building, run:

```bash
./prod/run.sh
```

To stop the service:

```bash
./prod/stop.sh
```

## Health checks

The API exposes lightweight operational endpoints:

- `GET /health` -> `{ "status": "ok" }`
- `GET /ready` -> `{ "status": "ready" }`

Post-deploy verification example:

```bash
curl -fsS "https://qurancorpus.app/api/health"
curl -fsS "https://qurancorpus.app/api/ready"
```

## Deploy

`deploy.sh` packages a release and uploads to the existing service host.

```bash
./deploy.sh
```

Optional environment variables:

- `SSH_KEY` (default: `../../dev/keys/fasthosts`)
- `REMOTE_HOST` (default: `admin-user@hunna.app`)
- `REMOTE_PATH` (default: `/var/www/qurancorpus.app/services`)
