# Schematic Spec: lint-config

## Overview

- **Name:** lint-config
- **Factory:** lintConfig
- **Type:** config
- **Folder:** src/lint-config/
- **Description:** Adds ESLint, Prettier, and EditorConfig configuration files to the project

## Schema Options

None

## Template Files

- `.editorconfig` — Standard EditorConfig settings
- `eslint.config.mjs` — ESLint flat config with Angular + TypeScript rules
- `.prettierrc.json` — Prettier config (printWidth: 100, singleQuote, Angular HTML parser override)
- `.prettierignore` — Files/folders excluded from Prettier

## Dependencies

| Package                                | Version | Type |
| -------------------------------------- | ------- | ---- |
| eslint                                 | 10.4.1  | dev  |
| angular-eslint                         | 22.0.0  | dev  |
| @angular-eslint/eslint-plugin          | 22.0.0  | dev  |
| @angular-eslint/eslint-plugin-template | 22.0.0  | dev  |
| @angular-eslint/template-parser        | 22.0.0  | dev  |
| @angular-eslint/builder                | 22.0.0  | dev  |
| typescript-eslint                      | 8.61.0  | dev  |
| @angular-eslint/builder                | 22.0.0  | dev  |

## npm Scripts

| Name     | Command       |
| -------- | ------------- |
| lint     | ng lint       |
| lint:fix | ng lint --fix |

## JSON Modifications

- `package.json` — Adds `prettier` config block (only if not already present)
- `angular.json` — Adds `@angular-eslint/schematics` to `cli.schematicCollections` (if missing); adds `lint` architect target to each project (if missing)

## Idempotency Notes

- Skips `prettier` block in `package.json` if it already exists
- Skips adding `@angular-eslint/schematics` to `schematicCollections` if already present
- Skips adding `lint` architect target per project if already defined

## Open Questions

None.
