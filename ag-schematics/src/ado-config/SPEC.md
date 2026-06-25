# Schematic Spec: ado-config

## Overview
- **Name:** ado-config
- **Factory:** adoConfig
- **Type:** config
- **Folder:** src/ado-config/
- **Description:** Adds an Azure DevOps default pull request template to the project

## Schema Options
None

## Template Files
- `.azuredevops/pull_request_template.md` — Minimal ADO PR template with starter sections: Description, Type of Change, Checklist

## Dependencies
None

## npm Scripts
None

## JSON Modifications
None

## Idempotency Notes
- If `.azuredevops/pull_request_template.md` already exists, skip creation and log a warning.

## Open Questions
None.
