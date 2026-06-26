# Schematic Spec: otel-config

## Overview

- **Name:** otel-config
- **Factory:** otelConfig
- **Type:** config
- **Folder:** src/otel-config/
- **Description:** Adds an OpenTelemetry Collector config file and patches nginx.conf to proxy OTLP exports

## Schema Options

None

## Template Files

- `otel-config.yaml` — OTel Collector configuration (receivers, processors, exporters)

## Dependencies

None

## npm Scripts

None

## JSON Modifications

None

## File Modifications

- `nginx.conf` — If it exists and does not already contain `location /otlp/`: inserts the OTLP proxy location block before the SPA fallback block (`# Angular SPA:`) or before `location / {` as a fallback. If `nginx.conf` does not exist, creates it with a full default config including /api/, /otlp/, SPA fallback, and static asset cache blocks.

## Idempotency Notes

- Skips patching nginx.conf if `location /otlp/` is already present
- Warns (logger.warn) if nginx.conf exists but no insertion point can be found

## Open Questions

None.
