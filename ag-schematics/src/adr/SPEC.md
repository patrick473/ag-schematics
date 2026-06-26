# Schematic Spec: adr

## Overview

- **Name:** adr
- **Factory:** adr
- **Type:** config
- **Folder:** src/adr/
- **Description:** Generates an Architecture Decision Record (ADR) markdown file

## Schema Options

| Option    | Type   | Default       | Description                                               |
| --------- | ------ | ------------- | --------------------------------------------------------- |
| title     | string | "My Decision" | The title of the ADR; also slugified to form the filename |
| number    | string | "0001"        | The ADR sequence number (e.g. 0001)                       |
| directory | string | "adr"         | Directory where the file is placed                        |

## Template Files

- `<directory>/<number>-<slug>.md` — Standard ADR markdown with sections: Status, Context, Decision, Consequences; date auto-filled from current date

## Dependencies

None

## npm Scripts

None

## JSON Modifications

None

## Idempotency Notes

None defined; schematic will overwrite if a file with the same number+slug already exists.

## Open Questions

None.
