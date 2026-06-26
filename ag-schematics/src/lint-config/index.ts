import { strings } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';
import { JSONFile } from '../utils/json-file';
import { installDevDependency } from '../utils/dependency-shortcuts';
import { versions } from '../versions';
import { addScript } from '../utils/script';

interface LintConfigOptions {}

function updatePrettierConfig(): Rule {
  return (tree: Tree) => {
    const pkgPath = '/package.json';
    if (!tree.exists(pkgPath)) {
      return;
    }

    const json = new JSONFile(tree, pkgPath);
    if (json.get(['prettier']) !== undefined) {
      return;
    }

    json.modify(['prettier'], {
      printWidth: 100,
      singleQuote: true,
      overrides: [
        {
          files: '*.html',
          options: {
            parser: 'angular',
          },
        },
      ],
    });
  };
}

function updateAngularJson(): Rule {
  return (tree: Tree) => {
    if (!tree.exists('/angular.json')) {
      return;
    }

    const json = new JSONFile(tree, '/angular.json');

    const collections = (json.get(['cli', 'schematicCollections']) as string[] | undefined) ?? [];
    if (!collections.includes('@angular-eslint/schematics')) {
      json.modify(
        ['cli', 'schematicCollections', collections.length],
        '@angular-eslint/schematics',
      );
    }

    const projects = json.get(['projects']) as Record<string, unknown> | undefined;
    if (projects) {
      for (const projectName of Object.keys(projects)) {
        if (!json.get(['projects', projectName, 'architect', 'lint'])) {
          json.modify(['projects', projectName, 'architect', 'lint'], {
            builder: '@angular-eslint/builder:lint',
            options: {
              lintFilePatterns: ['src/**/*.ts', 'src/**/*.html'],
            },
          });
        }
      }
    }
  };
}

export function lintConfig(options: LintConfigOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const sourceTemplates = url('./files');

    const toBeAddedDependencies = [
      installDevDependency('eslint', versions.eslint),
      installDevDependency('angular-eslint', versions.angularEslint),
      installDevDependency('@angular-eslint/eslint-plugin', versions.angularEslint),
      installDevDependency('@angular-eslint/eslint-plugin-template', versions.angularEslint),
      installDevDependency('@angular-eslint/template-parser', versions.angularEslint),
      installDevDependency('@angular-eslint/builder', versions.angularEslint),
      installDevDependency('@typescript-eslint/eslint-plugin', versions.typescriptEslint),
      installDevDependency('@typescript-eslint/parser', versions.typescriptEslint),
    ];
    const toBeAddedScripts = [addScript('lint', 'ng lint'), addScript('lint:fix', 'ng lint --fix')];
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        ...strings,
        ...options,
      }),
      move(''),
    ]);
    return chain([
      updateAngularJson(),
      updatePrettierConfig(),
      ...toBeAddedDependencies,
      ...toBeAddedScripts,
      mergeWith(sourceParametrizedTemplates),
    ])(tree, _context);
  };
}
