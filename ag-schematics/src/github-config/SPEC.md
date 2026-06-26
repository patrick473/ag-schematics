# Schematic Spec: github-config

## Overview
- **Name:** github-config
- **Factory:** githubConfig
- **Type:** config
- **Folder:** src/github-config/
- **Description:** Adds standard GitHub project files — PR template, issue templates, CI workflow, and Dependabot config

## Schema Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| defaultBranch | string | `"main"` | The default branch name used in CI workflow triggers and Dependabot config |
| nodeVersion | string | `"20"` | Node.js version used in the GitHub Actions CI workflow |

## Template Files
- `.github/pull_request_template.md` — PR description template with sections: Description, Type of Change, Checklist
- `.github/ISSUE_TEMPLATE/bug_report.md` — Bug report issue template with fields: description, steps to reproduce, expected/actual behaviour, environment
- `.github/ISSUE_TEMPLATE/feature_request.md` — Feature request issue template with fields: problem description, proposed solution, alternatives
- `.github/workflows/ci.yml` — GitHub Actions workflow triggered on push/PR to `<%= defaultBranch %>`; runs `npm ci`, `npm run build`, `npm test` on Node `<%= nodeVersion %>`
- `.github/dependabot.yml` — Dependabot config for `npm` ecosystem, weekly schedule, targeting `<%= defaultBranch %>`

## Dependencies
None

## npm Scripts
None

## JSON Modifications
None

## Idempotency Notes
- If any target file already exists, skip creation for that file and log a warning (do not overwrite).

## Open Questions
None.
