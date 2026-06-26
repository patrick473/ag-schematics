# Schematic Spec: sonar-config

## Overview

- **Name:** sonar-config
- **Factory:** sonarConfig
- **Type:** config
- **Folder:** src/sonar-config/
- **Description:** Adds a sonar-project.properties file to the project root

## Schema Options

| Option       | Type   | Default            | Description                    |
| ------------ | ------ | ------------------ | ------------------------------ |
| projectKey   | string | "f-service"        | SonarQube project key          |
| projectName  | string | "frontend-service" | SonarQube project display name |
| organization | string | "organization"     | SonarQube organization name    |

## Template Files

- `sonar-project.properties` — SonarQube properties file with projectKey, projectName, and organization interpolated

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
