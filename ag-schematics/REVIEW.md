# Schematic Review

_Reviewed: 2026-07-01 — ado-config, adr, docker-config, dynamic-app-config, github-config, gitignore-config, header, k8s-config, lint-config, npm-config, orval-config, otel-config, sheriff-config, sonar-config_

---

## ado-config

### ✅ Looks good
- Factory function `adoConfig` correctly matches the `#adoConfig` fragment in `collection.json`.
- Template file `files/.azuredevops/pull_request_template.md.template` exists and uses the `.template` extension.
- Idempotency guard correctly checks `tree.exists(templatePath)` before writing and logs a warning on skip.
- Schema is appropriately minimal (`"properties": {}`) since the schematic has no user-facing options.
- No Sheriff boundary violations — only `@angular-devkit` packages are imported.
- No security concerns — template path is hardcoded, no user input is interpolated anywhere.
- Test coverage is solid: file existence, three content assertions covering each major section, and an idempotency test covering the skip path.
- `collectionPath` resolves correctly (`__dirname` → `out/ado-config/`, `../collection.json` → `out/collection.json`).
- No `any` casts in tests.

### ⚠️ Suggestions
- **Unnecessary `strings` import**: `strings` is imported from `@angular-devkit/core` and spread into `applyTemplates`, but the template contains zero EJS interpolations. The import and spread can be removed.
- **Import order**: `@angular-devkit/core` appears before `@angular-devkit/schematics`. Swap the two import blocks to match the project convention.
- **Test runner reuse**: Each test case instantiates a fresh `SchematicTestRunner`. Sharing a single runner instance at describe scope would reduce overhead.

---

## adr

### ✅ Looks good
- Factory function name `adr` matches the `#fragment` in `collection.json` exactly.
- All template variables (`number`, `title`, `date`, `slug`) are passed to `applyTemplates` and the template filename uses Angular DevKit's `__variable__` interpolation correctly.
- Template file uses the `.template` extension.
- Schema properties all have `type`, `description`, `default`, and `x-prompt`. No `required` alongside `default`.
- Option names are `camelCase`. Schematic name in `collection.json` is `kebab-case`.
- No npm dependencies, scripts, or JSON modifications — consistent with SPEC.md.
- No hardcoded secrets or credentials. No user input interpolated into shell commands.
- Tests cover: default directory, custom directory, title dasherization, file content (heading, date format, standard sections), and default option values.

### ⚠️ Suggestions
- **No idempotency guard**: SPEC.md notes the schematic will overwrite if a file with the same number+slug already exists. Consider checking `tree.exists(filePath)` and skipping or warning, plus a corresponding idempotency test.
- **No numeric validation on `number`**: A user could pass `"abc"` and get a nonsensical filename. Consider adding a `"pattern": "^\\d+$"` constraint to the schema.
- **`strings` spread is unused in the template**: `slug` is pre-computed in the factory rather than delegated to the template, making the `strings` spread into `applyTemplates` dead code.
- **Surprising dasherization in test comment**: The test for `'Use PostgreSQL'` produces `use-postgre-sql`; a brief comment would clarify this is intentional behaviour of `strings.dasherize`.

---

## docker-config

### ✅ Looks good
- Factory function `dockerConfig` correctly matches the `#dockerConfig` fragment in `collection.json`.
- All three template files exist in `files/` (`Dockerfile.template`, `compose.yaml.template`, `nginx.conf.template.template`).
- All EJS variables (`dasherize`, `applicationName`, `backend_name`, `port`) are present in the `applyTemplates` call.
- Schema is complete: all properties have `type`, `description`, `default`, and `x-prompt`. No `required` used alongside `default`. Option names are `camelCase`.
- No Sheriff boundary violations, no hardcoded secrets.
- TypeScript strict-mode compliance — no `any`, no unused locals.
- Tests cover all three generated files, multiple meaningful content assertions, and both custom and default option values.

### ⚠️ Suggestions
- **Import order**: `@angular-devkit/core` is imported before `@angular-devkit/schematics`. Swap to match project convention.
- **Unnecessary `backend_name` alias**: `index.ts` adds `backend_name: options.backendName` solely so the template can call `dasherize(backend_name)`. Since `backendName` is already in context via `...options`, the template could use `dasherize(backendName)` directly.
- **No content assertion for `nginx.conf.template`**: File presence is tested but no meaningful content is asserted (e.g., `proxy_pass`, `resolver`, `BACKEND_HOST` directives).
- **`collection.json` description is stale**: Still reads "Adds a Dockerfile and docker-compose.yaml" — uses the old `docker-compose.yaml` filename and omits `nginx.conf.template`.
- **No idempotency guard**: `mergeWith` is called without an explicit `MergeStrategy`; re-running on a project that already has a `Dockerfile` will throw a merge conflict.

---

## dynamic-app-config

### ✅ Looks good
- Factory name `dynamicAppConfig` correctly matches `#dynamicAppConfig` in `collection.json`.
- All four template files exist in `files/`; `applyTemplates({ ...options })` supplies `configPath`, the only `<%= %>` variable used.
- `filter((path) => !tree.exists(path))` correctly handles file-existence idempotency for generated files.
- `chain()` is used appropriately to compose three distinct rules without unnecessary nesting.
- Schema: `configPath` has `type`, `description`, `default`, and `x-prompt`. No `required` alongside `default`.
- `modifyAppModule()` and `appendEnvironmentComment()` both guard against re-application.
- Tests use the correct `collectionPath`; all four generated files have both presence and content assertions; both default and custom `configPath` values are exercised; idempotency is explicitly tested.

### ⚠️ Suggestions
- **Import order**: `import * as ts from 'typescript'` appears before the `@angular-devkit/schematics` block. Per project convention, Angular DevKit imports should come first.
- **SPEC.md discrepancy**: The spec states "app.module.ts modification uses `@schematics/angular` AST utilities," but the implementation uses the raw TypeScript compiler API directly. The spec should reflect reality.
- **Deprecated RxJS API in template**: `app-initializer.ts.template` uses `.toPromise()` which is deprecated in RxJS 7+. Consider replacing with `firstValueFrom(...)`.
- **Missing edge-case test**: No test covers the path where `app.module.ts` exists but contains no `@NgModule` decorator (the `logger.warn` / skip path in `findNgModuleObjectLiteral`).

### ❌ Issues
- **Duplicate `import` declaration when `HttpClientModule` is already imported**: `modifyAppModule()` unconditionally appends a block of four `import` statements (including `import { HttpClientModule, HttpClient } from '@angular/common/http'`) whenever `appInitializer` is not yet present. The guard `if (!content.includes('HttpClientModule'))` only prevents a duplicate entry in the `imports[]` array — it does not prevent a duplicate `import` declaration at the top of the file. If a project already imports `HttpClientModule`, running the schematic produces a duplicate `import` statement that will be flagged as a `no-duplicate-imports` lint error. Fix by checking `content.includes('HttpClientModule')` (and similarly for `AppConfigService`, `APP_INITIALIZER`, and `appInitializer`) before pushing each individual import into `newImports`.

---

## github-config

### ✅ Looks good
- Factory function `githubConfig` matches the `#githubConfig` fragment in `collection.json`.
- All six template files exist on disk with the `.template` extension.
- `applyTemplates` passes both `defaultBranch` and `nodeVersion` — every `<%= %>` interpolation is satisfied.
- Schema has `type`, `description`, `default`, and `x-prompt` for all properties; no `required` alongside `default`.
- Idempotency is correctly implemented: `filter((path) => !tree.exists(path))` prevents overwrites.
- Tests cover all generated files, meaningful content assertions, custom option values, and the skip-existing idempotency path.
- No security concerns; TypeScript strict mode satisfied.

### ⚠️ Suggestions
- **Import order**: `@angular-devkit/core` is imported before `@angular-devkit/schematics`. Swap the two import blocks.
- **SPEC.md is incomplete**: `codeql.yml` is generated and tested but is not listed under "Template Files" in `SPEC.md`.
- **SPEC.md Dependabot description is partial**: The spec says Dependabot tracks the `npm` ecosystem only, but `dependabot.yml.template` also configures `github-actions` updates.
- **Narrow idempotency test coverage**: The single idempotency test only pre-seeds `pull_request_template.md`. Consider testing a workflow file as well.

---

## gitignore-config

### ✅ Looks good
- Factory name `gitignoreConfig` matches the `#gitignoreConfig` fragment in `collection.json`.
- Template file `files/.gitignore.template` exists; the template contains no EJS interpolations, so no variables are missing.
- Schema is correctly defined with an empty `properties` object.
- No Sheriff boundary violations, no security concerns.
- Tests assert both file presence and meaningful content (three separate content assertions).

### ⚠️ Suggestions
- **Dead `strings` import**: `strings` is imported and spread into `applyTemplates`, but the template has no EJS interpolations. Both can be removed.
- **Empty `GitignoreConfigOptions` interface**: The interface and the `options` spread into `applyTemplates` serve no purpose; consider removing both.
- **No idempotency guard**: `mergeWith` uses `MergeStrategy.Default`, which will throw if `.gitignore` already exists. Consider `MergeStrategy.Skip` and a corresponding idempotency test.
- **Import order**: `@angular-devkit/core` appears before `@angular-devkit/schematics`. Swap to match convention.
- **`SchematicTestRunner` re-instantiated per test**: Move to describe scope to reduce repetition.

---

## header

### ✅ Looks good
- Factory function `header` in `index.ts` matches the `#header` fragment in `collection.json`.
- All four template files (`header.ts.template`, `header.html.template`, `header.scss.template`, `header.spec.ts.template`) are present in `files/header/`.
- `move()` uses `options.path ?? 'src/app/components/common'` — sensible null-coalescing default.
- Schema: `path` has `"type"`, `"description"`, `"default"`, and `"x-prompt"`. No `"required"` alongside `"default"`.
- No Sheriff boundary violations, no hardcoded secrets.
- `collectionPath` correctly uses `../../collection.json` for the nested `out/components/header/` location.
- Custom `path` option is exercised; content assertions exist for `.ts` and `.html` files.

### ⚠️ Suggestions
- **Import order in `index.ts`**: `@angular-devkit/core` appears before `@angular-devkit/schematics`. Swap to match convention.
- **Hardcoded Dutch placeholder text**: `header.html.template` contains `Gebruikersnaam` (Dutch for "Username"). Consider an English placeholder or a template variable.
- **Hardcoded component selector prefix**: `pr-header` is hardcoded. Consider adding a `prefix` schema option (defaulting to `"pr"`) so consumers can match their project's Angular selector prefix.
- **No idempotency guard**: Running the schematic twice will fail with the default `MergeStrategy.Error`. Document this decision in SPEC.md and consider adding a collision test.
- **`header.spec.ts` not asserted in tests**: Neither the default nor the custom-path test asserts that `header.spec.ts` is present in `tree.files`.

### ❌ Issues
- **`header.spec.ts.template` references the wrong class throughout**: The generated spec imports `Toolbar` from `'./toolbar'`, uses `describe('Toolbar', ...)`, and types variables as `Toolbar` / `ComponentFixture<Toolbar>`. The actual component class is `Header` (in `header.ts.template`). The generated spec file will fail to compile. All references to `Toolbar` and `'./toolbar'` must be replaced with `Header` and `'./header'`.
- **CSS class mismatch between SCSS and HTML templates**: `header.scss.template` defines `.header`, `.header-user`, and `.header-spacer`, but `header.html.template` applies classes `toolbar`, `toolbar-user`, and `toolbar-spacer`. None of the defined styles will match any element in the generated component.

---

## k8s-config

### ✅ Looks good
- Factory function `k8sConfig` exactly matches the `#k8sConfig` fragment in `collection.json`.
- All three template files exist in `files/k8s/` with the correct `.template` extension.
- `applyTemplates` receives `...strings` and `...options`, covering every `<%= ... %>` expression in the templates.
- Schema is complete: all five properties have `type`, `description`, `default`, and `x-prompt`. No `required` alongside `default`.
- Idempotency is correctly handled: `filter((path) => !tree.exists(path))` guards all three manifests; `addScript` independently guards the `k8s:apply` script.
- Sheriff boundaries respected. No security concerns. `chain()` used correctly.
- Test coverage is thorough: all three files asserted present; all five options exercised with custom values; both idempotency paths have dedicated tests.

### ⚠️ Suggestions
- **Import order**: `@angular-devkit/core` is imported before `@angular-devkit/schematics`. Swap to match convention.
- **Ingress test — missing content assertion on `applicationName`**: The `sets the ingressHost` test only verifies the `host:` field. The ingress template also interpolates `dasherize(applicationName)` in `metadata.name`, `metadata.namespace`, and `backend.service.name`. Consider adding at least one assertion on a non-host field.

---

## lint-config

### ✅ Looks good
- Factory name `lintConfig` matches the `#lintConfig` fragment in `collection.json`.
- All imported utilities (`JSONFile`, `installDevDependency`, `versions`, `addScript`) exist and are used.
- `chain()` correctly composes multiple rules without unnecessary nesting.
- All five `files/` templates are present and use the `.template` extension.
- `JSONFile` helper is used for all `package.json` and `angular.json` modifications.
- Sheriff module boundaries respected; no security issues.
- Idempotency guards in place for the `prettier` block, `@angular-eslint/schematics` collection entry, and `lint` architect target.
- Every generated file has a presence test; meaningful content assertions exist for `.editorconfig`, `.eslintrc.json`, and `.prettierrc.json`.
- All 8 dependencies, both scripts, and JSON modifications each have dedicated tests with idempotency and missing-file cases covered.

### ⚠️ Suggestions
- **Import order in `index.ts`**: `@angular-devkit/core` is imported before `@angular-devkit/schematics`. Swap to match convention.
- **No content assertions for `.eslintignore` and `.prettierignore`**: Only file existence is tested. Adding a `toContain` check on each would give meaningful coverage.
- **`prettier` not added as a dev dependency**: The schematic generates `.prettierrc.json` and a `prettier` block in `package.json`, but `prettier` itself is never added to `devDependencies`. Users must install it separately before format commands work.
- **Whitespace in glob pattern**: `.eslintrc.json.template` contains `"**/*.spec.{ts,tsx, js}"` (note the space before `js`). This breaks brace expansion; spec files ending in `.js` will not be matched. Should be `{ts,tsx,js}`.

### ❌ Issues
- **ESLint legacy config format incompatible with ESLint 10**: `versions.eslint` is `10.4.1`. ESLint 10 removed support for the legacy `.eslintrc.*` format entirely. The `.eslintrc.json.template` uses legacy-only properties (`root`, `ignorePatterns`, `overrides`, `parserOptions`) that ESLint 10 will not recognise, causing linting to fail immediately after the schematic runs. The template must be replaced with a flat-config file (`eslint.config.js.template` or `eslint.config.mjs.template`) using the `angular-eslint` flat config utilities.
- **Prettier config split across two locations — Angular HTML override is unreachable**: `updatePrettierConfig()` adds a `prettier` block (including the Angular HTML parser `overrides`) to `package.json`, but the schematic also generates a `.prettierrc.json` via template. Prettier resolves config by finding the nearest file, so `.prettierrc.json` takes precedence over the `package.json` block, which is silently ignored. The net result is that HTML files will never use the Angular parser. Fix by consolidating: either add the `overrides` array to `.prettierrc.json.template` and remove `updatePrettierConfig()`, or drop the template and rely solely on `updatePrettierConfig()` with the full config.

---

## npm-config

### ✅ Looks good
- Factory function name `npmConfig` matches the `#fragment` in `collection.json` exactly.
- Schematic name `npm-config` in `collection.json` is `kebab-case`.
- `applyTemplates` receives `...strings` and `...options`; `.nvmrc.template` contains no EJS interpolation so no variables are missing.
- `move('')` is correctly passed to `apply`.
- Import order is correct: Angular DevKit imports first, then `@angular-devkit/core`.
- No Sheriff boundary violations, no hardcoded secrets, no user input interpolated into shell commands.
- TypeScript `strict` mode is satisfied.
- The node version content assertion provides meaningful coverage.

### ⚠️ Suggestions
- **`NpmConfigOptions` is an empty interface**: Consider removing it entirely since it serves no purpose.
- **No documentation of overwrite behaviour**: SPEC.md notes "None defined" for idempotency. Document whether overwriting existing `.npmrc`/`.nvmrc` is intentional (the default `MergeStrategy.Error` will throw if files already exist).

### ❌ Issues
- **Missing `.npmrc.template` file**: SPEC.md states both `.npmrc` and `.nvmrc` are generated, but `files/` only contains `.nvmrc.template`. The `.npmrc` file is never generated at runtime.
- **No test for `/.npmrc`**: The test "creates the npm config files" only asserts `/.nvmrc` is present; `/.npmrc` is neither asserted to exist nor its content verified. This gap also masks the missing template above.

---

## orval-config

### ✅ Looks good
- Factory name `orvalConfig` matches the `#fragment` in `collection.json`.
- All imported utilities (`versions`, `installDevDependency`, `addScript`) exist and are correctly wired.
- Both template files (`orval.config.ts.template`, `openapi.yaml.template`) exist in `files/`.
- Schema correctly defines no properties for a no-option schematic.
- Sheriff boundaries respected.
- `installDevDependency` uses `ExistingBehavior.Skip`, correctly guarding against duplicate dependency entries.
- `addScript` checks for the existing key before writing.
- No hardcoded secrets or credentials.
- Tests cover file presence, content, dev dependency, and dependency idempotency. `collectionPath` is correct.

### ⚠️ Suggestions
- **Import order**: `@angular-devkit/core` is imported before `@angular-devkit/schematics`. Swap to match convention.
- **Unnecessary outer Rule wrapper**: The factory wraps `chain([...])(tree, _context)` inside an arrow function but performs no tree operations outside of `chain`. The factory could return `chain([...])` directly.
- **No script idempotency test**: `addScript` guards against overwriting an existing `api:gen` script, but there is no test covering that path.
- **No `MergeStrategy` on `mergeWith`**: Running the schematic twice will throw a conflict if `orval.config.ts` or `openapi.yaml` already exist. Consider `MergeStrategy.Skip` and document the decision in SPEC.md.
- **`openapi.yaml.template` is fully empty**: Even a minimal three-line OpenAPI 3.0 stub would make the generated file immediately valid for Orval to parse without error.

---

## otel-config

### ✅ Looks good
- Factory name `otelConfig` matches the `#otelConfig` fragment in `collection.json`.
- Schema has `type`, `description`, `default`, and `x-prompt` for `nginxFile`; no `required` alongside `default`.
- Template file `otel-config.yaml.template` exists and uses the `.template` extension.
- No Sheriff boundary violations, no hardcoded secrets.
- `otel-config.yaml.template` is entirely static, which is correct.
- Idempotency guard (`content.includes(OTLP_LOCATION_MARKER)`) correctly skips patching if the block is already present.
- `logger.warn` is emitted when the file exists but no insertion point is found.
- `SchematicTestRunner` uses the correct `collectionPath`.

### ⚠️ Suggestions
- **Import order**: `@angular-devkit/core` is imported before `@angular-devkit/schematics`. Swap the two import blocks.
- **No custom `nginxFile` option tested**: Every test passes `{}` (default options). At least one test should pass `{ nginxFile: '/custom/nginx.conf.template' }` to exercise the custom-path branch.
- **SPEC.md default discrepancy**: The options table lists the `nginxFile` default as `"nginx.conf.template"` (no leading slash), but both `schema.json` and `index.ts` use `"/nginx.conf.template"` (with leading slash).

### ❌ Issues
- **Four tests create `/nginx.conf` instead of `/nginx.conf.template`**: The schematic's default `nginxFile` is `/nginx.conf.template`. When `tree.exists('/nginx.conf.template')` returns false, the schematic generates a brand-new default file (which already contains `location /otlp/`). As a result:
  - `"adds the /otlp/ location block to an existing nginx.conf"` — creates `/nginx.conf`, but assertions run against the generated default `/nginx.conf.template`. The existing-file modification path is never exercised.
  - `"inserts the /otlp/ block before the SPA fallback location"` — same wrong path; assertions pass against the hardcoded default.
  - `"does not duplicate the /otlp/ block if already present"` — creates `/nginx.conf` with the OTLP block, but the schematic writes the default `/nginx.conf.template`. The idempotency guard is never actually exercised.
  - `"inserts the /otlp/ block before the root location when there is no SPA comment marker"` — same wrong path.

  **Fix:** In each of these tests, call `initialTree.create('/nginx.conf.template', ...)` instead of `initialTree.create('/nginx.conf', ...)`.

---

## sheriff-config

### ✅ Looks good
- Factory function `sheriffConfig` correctly matches `#sheriffConfig` in `collection.json`.
- All imported utilities (`JSONFile`, `installDevDependency`, `versions`) exist and are actively used.
- `chain()` is used correctly for multiple sequential operations without unnecessary nesting.
- Template file `sheriff.config.ts.template` exists; `filter((path) => !tree.exists(path))` prevents overwriting an existing config.
- `JSONFile` helper is used for all ESLint JSON modifications.
- Schema is valid for a zero-option schematic.
- Import order is correct. No barrel imports. Schematic name is `kebab-case`; factory is `camelCase`.
- No Sheriff boundary violations, no security concerns.
- Tests cover generated file presence and meaningful content; both dev dependencies are verified; all four idempotency paths are covered.

### ⚠️ Suggestions
- **Missing edge-case test**: No test covers the `tsOverrideIndex === -1` branch (`.eslintrc.json` exists but has no `*.ts` override). A tree with only an `*.html` override would exercise this path.
- **Idempotency test could be stronger**: The "does not duplicate the plugin if already present" test only asserts the plugin count; it does not assert that `@softarc/sheriff/dependency-rule` is also not duplicated in the same run.
- **`SheriffConfigOptions` is an empty interface**: The interface and the `options` spread into `applyTemplates` contribute nothing; both can be removed.

---

## sonar-config

### ✅ Looks good
- Factory function name `sonarConfig` in `index.ts` exactly matches the `#sonarConfig` fragment in `collection.json`.
- All EJS variables (`dasherize`, `projectKey`, `projectName`, `organization`) are correctly supplied to `applyTemplates`.
- Template file `sonar-project.properties.template` exists and uses the `.template` extension.
- All schema properties have `type`, `description`, `default`, and `x-prompt`. No `required` alongside defaults.
- Option names are `camelCase`; schematic name is `kebab-case`.
- No imports from other schematics; Sheriff module boundaries respected.
- No hardcoded secrets or credentials.
- Tests use `SchematicTestRunner` with the correct `collectionPath`.
- File presence, content with custom values, default values, and static properties are all covered.

### ⚠️ Suggestions
- **Import order**: `@angular-devkit/core` is imported before `@angular-devkit/schematics`. Swap to match convention.
- **`organization` not tested for dasherization**: Tests exercise `dasherize()` for `projectKey` and `projectName` but never pass a non-lowercase `organization` value to verify `sonar.organization` is correctly dasherized.
- **Default `organization` not asserted**: The "uses default values" test only checks `projectKey` and `projectName`; it omits asserting `sonar.organization=organization`.
- **No idempotency guard**: The default `MergeStrategy.Error` will throw if `sonar-project.properties` already exists. Consider `MergeStrategy.Skip` and a corresponding test.

---

## Summary

Reviewed 14 schematic(s): 0 had no issues, 9 had suggestions only (ado-config, adr, docker-config, github-config, gitignore-config, k8s-config, orval-config, sheriff-config, sonar-config), 5 had blocking issues (dynamic-app-config, header, lint-config, npm-config, otel-config).
