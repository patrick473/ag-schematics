



⸻

name: create-schematic
description: >
Create a new schematic in the ag-schematics workspace.
Trigger when the user requests:

* add a schematic
* create a schematic
* scaffold a schematic
* add schematic to collection
* generate a new schematic

⸻

Purpose

Create a new schematic that follows all existing ag-schematics conventions.

The generated schematic must be immediately buildable, testable, and registered in the collection.

⸻

Required Workflow

Perform the following steps in order:

1. Determine the schematic name.
2. Determine the schematic type:
    * Config schematic
    * Component schematic
3. Create the folder structure.
4. Create schema.json.
5. Create index.ts.
6. Create template files.
7. Register the schematic in collection.json.
8. Add tests.
9. Update versions.ts if dependencies are added.
10. Run tests.
11. Report created and modified files.

Do not skip any step.

⸻

Naming Rules

Schematic names must use kebab-case.

Example:

my-feature-config

Derived values:

Usage	Value
Schematic name	my-feature-config
Schema $id	my-feature-config
Collection key	my-feature-config
Exported function	myFeatureConfig

⸻

Folder Structure

Config schematic

src/<name>/
  index.ts
  schema.json
  index_spec.ts
  files/

Component schematic

src/components/<name>/
  index.ts
  schema.json
  index_spec.ts
  files/

⸻

Schema Rules

Every schematic must contain a schema.json.

Requirements:

* $id equals schematic name
* type is always object
* every option has a default value
* prefer string and number properties
* avoid enums unless explicitly requested
* avoid $ref unless already used in the workspace

If no options are needed:

{
  "properties": {}
}

is acceptable.

⸻

Implementation Rules

Template-only schematic

Use:

* apply
* applyTemplates
* mergeWith
* move
* url

Multi-step schematic

Use chain() whenever the schematic performs more than one action.

Examples:

* template generation
* dependency installation
* script creation
* JSON modification
* file modification

⸻

Idempotency Rules

The schematic must be safe to run multiple times.

Before modifying files:

* check whether content already exists
* check whether JSON properties already exist
* do not duplicate dependencies
* do not duplicate scripts

Examples:

if (json.get(path) !== undefined) {
  return;
}
if (content.includes(marker)) {
  return;
}

⸻

Dependency Rules

When npm packages are installed:

1. Add versions to versions.ts.
2. Use existing dependency helper utilities.
3. Add tests that verify dependency installation.
4. Add tests that verify existing versions are preserved.

⸻

Template Rules

Template files belong in:

files/

Use:

*.template

Examples:

foo.ts.template
<%= dasherize(name) %>.ts.template

Available helpers:

dasherize
camelize
classify

All schematic options must be passed through applyTemplates.

⸻

Collection Registration

Every schematic must be added to collection.json.

Config schematic:

{
  "factory": "./my-feature-config/index#myFeatureConfig",
  "schema": "./my-feature-config/schema.json"
}

Component schematic:

{
  "factory": "./components/my-component/index#myComponent",
  "schema": "./components/my-component/schema.json"
}

The collection key must exactly match the schematic name.

⸻

Test Requirements

Every schematic must include:

1. File creation test.
2. File content test.

Additionally include:

Dependencies

* dependency added
* existing dependency preserved

Scripts

* script added

JSON modifications

* JSON updated correctly
* duplicate execution remains idempotent

File modifications

* file updated correctly
* duplicate execution remains idempotent

⸻

Completion Checklist

Before finishing verify:

* schema exists
* index.ts exists
* tests exist
* templates exist
* collection.json updated
* versions.ts updated if needed
* schematic builds
* tests pass

⸻

Final Output

Provide:

* schematic name
* schematic type
* files created
* files modified
* dependencies added
* scripts added
* test results