# Schematic Spec: orval-config

## Overview

- **Name:** orval-config
- **Factory:** orvalConfig
- **Type:** config
- **Folder:** src/orval-config/
- **Description:** Installs orval and adds orval.config.ts and an empty openapi.yaml to the project root

## Schema Options

None

## Template Files

- `orval.config.ts` — Orval configuration pointing to openapi.yaml and defining output settings
- `openapi.yaml` — Empty/skeleton OpenAPI spec scaffold

## Dependencies

| Package | Version | Type |
| ------- | ------- | ---- |
| orval   | 8.16.0  | dev  |

## npm Scripts

| Name    | Command                        |
| ------- | ------------------------------ |
| api:gen | orval --config orval.config.ts |

## JSON Modifications

None

## Idempotency Notes

None defined.

## Open Questions

None.
