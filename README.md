# ag-schematics

A collection of [Angular schematics](https://angular.dev/tools/cli/schematics) for scaffolding common project configuration and components.

## Schematics

See [SCHEMATICS.md](SCHEMATICS.md) for a full list of available schematics.

## Installation

```bash
npm install ag-schematics --save-dev
```

## Usage

Run any schematic using the Angular CLI:

```bash
ng generate ag-schematics:<schematic-name> [options]
```

**Examples:**

```bash
# Generate an ADR
ng generate ag-schematics:adr --title "Use OpenAPI for API contracts"

# Add Docker configuration
ng generate ag-schematics:docker-config

# Add Kubernetes manifests
ng generate ag-schematics:k8s-config
```

## Requirements

- Node.js 20+
- Angular CLI

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, project structure, and how to add new schematics.

## License

[MIT](LICENSE)
