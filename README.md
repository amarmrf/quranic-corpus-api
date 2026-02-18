# Quranic Corpus API

This repo contains the backend server API for the Quranic Arabic Corpus 2.0.

More details on the Corpus 2.0 project (and frontend code) can be found here: https://github.com/kaisdukes/quranic-corpus

## Java Service (Original)

This repo includes dependencies from [GitHub packages](https://github.com/kaisdukes/memseqdb/packages), which requires a classic personal access token:

```bash
export GITHUB_TOKEN=...
./gradlew build
```

Legacy deploy script:

```bash
./deploy.sh
```

## TypeScript Service (Port)

The TypeScript/Fastify port lives in `./ts-api`.

Local run:

```bash
cd ts-api
npm ci
npm run dev
```

Build + package release artifacts:

```bash
cd ts-api
npm run build
npm run prepare-release
```

Deploy TypeScript service to the existing host/path:

```bash
./deploy-ts.sh
```

Equivalent command directly from `ts-api`:

```bash
cd ts-api
./deploy.sh
```

Optional deployment env vars for TS deploy:

- `SSH_KEY`
- `REMOTE_HOST`
- `REMOTE_PATH`

## Logging

By default, the Java API service logs to `/var/log/corpus/quranic-corpus-api.log`. Ensure that this folder exists and that the service has correct permissions to write to the folder.

The TypeScript run script currently uses `nohup` with output redirected to `/dev/null`.
