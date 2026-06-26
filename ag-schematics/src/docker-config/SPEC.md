# Schematic Spec: docker-config

## Overview

- **Name:** docker-config
- **Factory:** dockerConfig
- **Type:** config
- **Folder:** src/docker-config/
- **Description:** Adds a Dockerfile, compose.yaml, and nginx.conf to the project root

## Schema Options

| Option          | Type   | Default            | Description                                          |
| --------------- | ------ | ------------------ | ---------------------------------------------------- |
| applicationName | string | "frontend-service" | Docker image name and compose service name           |
| backendName     | string | "backend-service"  | Backend service hostname set as BACKEND_HOST env var |
| port            | number | 4200               | Host port exposed in compose.yaml                    |

## Template Files

- `Dockerfile` — Multi-stage Angular build image; uses applicationName and backendName
- `compose.yaml` — Docker Compose file exposing port; references applicationName and port
- `nginx.conf` — nginx reverse-proxy config with /api/ proxy to backend

## Dependencies

None

## npm Scripts

None

## JSON Modifications

None

## Idempotency Notes

None defined.

## Open Questions

None.
