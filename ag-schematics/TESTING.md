# Testing Schematics Locally

This guide covers how to test your schematics against a real Angular project using `npm link`.

## Prerequisites

- Angular CLI installed globally (`npm install -g @angular/cli`)
- An Angular test project (see step 2 below)

## Steps

### 1. Build the schematic library

From the `ag-schematics/` directory:

```bash
npm run build
```

This compiles TypeScript to `dist/` and copies the collection manifest, schemas, and template files.

### 2. Link the library globally

```bash
npm link
```

This registers `ag-schematics` as a globally available package on your machine.

### 3. Create a test Angular project (first time only)

```bash
ng new my-test-app --ssr=false --routing=false --style=scss --ai-config=none
cd my-test-app
ng add @angular/material --theme=indigo-pink 
```

### 4. Link the schematic into the test project

From inside the test project directory:

```bash
npm link ag-schematics
```

### 5. Run a schematic

```bash
ng generate ag-schematics:button-component my-button
```

> **Note:** The `name` argument is positional — pass it directly after the schematic name, not as `--name`.

## Iterating on changes

After modifying the schematic source, rebuild and the linked test project picks up the changes automatically:

```bash
# In ag-schematics/
npm run build

# In my-test-app/ — no re-linking needed
ng generate ag-schematics:button-component my-button
```

## Cleaning up

```bash
# In my-test-app/
npm unlink ag-schematics

# In ag-schematics/
npm unlink
```

## Available schematics

| Schematic | Usage |
|-----------|-------|
| `button-component` | `ng generate ag-schematics:button-component <name>` |
| `ag-schematics` | `ng generate ag-schematics:ag-schematics` |
| `test-component` | `ng generate ag-schematics:test-component` |

## Alternative: dry run without an Angular project

You can preview what files would be generated without needing a full Angular project:

```bash
npx @angular-devkit/schematics-cli dist/collection.json:button-component my-button --dry-run
```

Run this from the `ag-schematics/` directory after building.
