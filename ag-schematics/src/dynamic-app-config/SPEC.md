# Schematic Spec: dynamic-app-config

## Overview

- **Name:** dynamic-app-config
- **Factory:** dynamicAppConfig
- **Type:** config
- **Folder:** src/dynamic-app-config/
- **Description:** Adds runtime dynamic app configuration via APP_INITIALIZER, an AppConfigService, and a default config JSON asset (NgModule bootstrap).

## Schema Options

| Option     | Type   | Default                  | Description                                            |
| ---------- | ------ | ------------------------ | ------------------------------------------------------ |
| configPath | string | `assets/app-config.json` | URL path to the JSON config asset fetched at bootstrap |

## Template Files

- `src/assets/app-config.json` — Runtime config asset: `{ "apiUrl": "" }`
- `src/app/core/app-config.model.ts` — TypeScript interface: `export interface AppConfig { apiUrl: string; }`
- `src/app/core/app-config.service.ts` — `@Injectable({ providedIn: 'root' })` service that stores the loaded `AppConfig` and exposes a `config` getter; populated by the initializer
- `src/app/app-initializer.ts` — `APP_INITIALIZER` factory; uses `HttpClient` to GET `configPath`, stores the result in `AppConfigService`; returns `() => Promise<void>`

## TypeScript Modifications

- `src/app/app.module.ts` — Add `HttpClientModule` to `imports[]`; add `APP_INITIALIZER` provider using the factory from `app-initializer.ts` with `deps: [HttpClient, AppConfigService]` and `multi: true`
- `src/environments/environment.ts` — Append comment: `// Dynamic config is loaded at runtime via AppConfigService. Avoid hardcoding API URLs here.`

## Dependencies

None. Uses Angular's built-in `HttpClient` only.

## npm Scripts

None.

## JSON Modifications

None.

## Idempotency Notes

- Skip generating a file if it already exists at the target path.
- Skip adding the `APP_INITIALIZER` provider to `app.module.ts` if a provider referencing the initializer factory is already present.

## Open Questions

None — all questions resolved:

- `environment.prod.ts` is **not** modified.
- `app.module.ts` modification uses custom AST utilities.
- `AppConfig` is fixed to `{ apiUrl: string }` — no extensibility option.
