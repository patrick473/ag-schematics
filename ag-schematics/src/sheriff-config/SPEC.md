# Schematic Spec: sheriff-config

## Overview

- **Name:** sheriff-config
- **Factory:** sheriffConfig
- **Type:** config
- **Folder:** src/sheriff-config/
- **Description:** Adds Sheriff module boundary enforcement to the project

## Schema Options

None

## Template Files

- `sheriff.config.ts` — Sheriff configuration file with empty tagging and depRules

## Dependencies

| Package                        | Version | Type |
| ------------------------------ | ------- | ---- |
| @softarc/sheriff-core          | 0.19.6  | dev  |
| @softarc/eslint-plugin-sheriff | 0.19.6  | dev  |

## npm Scripts

None

## JSON Modifications

- `.eslintrc.json` — Adds `@softarc/sheriff` to the `plugins` array and adds `@softarc/sheriff/dependency-rule: "error"` to the rules of the TypeScript override (if the file exists)

## Idempotency Notes

- Skips creating `sheriff.config.ts` if it already exists
- Skips adding `@softarc/sheriff` to plugins if already present
- Skips adding `@softarc/sheriff/dependency-rule` rule if already present
- Logs a warning and skips ESLint updates if `.eslintrc.json` does not exist

## Open Questions

None.
