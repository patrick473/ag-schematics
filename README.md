# ag-schematics

An Angular schematics library built with `@angular-devkit/schematics`.

## Development

> All commands are from the ag-schematics folder unless otherwise specified.

### Install dependencies

```bash
npm install
```

### Build

Compiles TypeScript to `dist/` (spec files excluded). The `dist/` folder is the publishable artifact.

```bash
npm run build
```

Output:

```text
dist/
  collection.json
  ag-schematics/
    index.js
    index.d.ts
  test-component/
    index.js
    index.d.ts
```

### Test

Compiles everything (including spec files) to `out/` and runs the Jasmine test suite.

```bash
npm test
```

## Project structure

```text
src/
  collection.json          # Schematic collection manifest
  ag-schematics/
    index.ts               # Schematic implementation
    index_spec.ts          # Tests
  test-component/
    index.ts               # Schematic implementation
    index_spec.ts          # Tests
tsconfig.json              # Base compiler config (used by npm test → out/)
tsconfig.lib.json          # Lib build config (used by npm run build → dist/)
```

## Using the schematics

After building, link or publish the package and run a schematic with the Angular CLI:

```bash
ng generate ag-schematics:ag-schematics
ng generate ag-schematics:test-component
```

### Manual testing

see [TESTING.md](ag-schematics/TESTING.md) for instructions on how to manually test the schematics in a separate Angular project.