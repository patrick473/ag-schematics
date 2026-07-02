import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { versions } from '../utils/versions';
import * as path from 'node:path';
import {
  treeWithPackageJson,
  expectDependency,
  expectScript,
  expectPackageJsonField,
  treeWithoutPackageJson,
  expectFileContains,
  expectFileExists,
  treeWithFile,
} from '../utils/test/tree-helpers';
import { DependencyType } from '../utils/dependency';

const collectionPath = path.join(__dirname, '../collection.json');

const minimalAngularJson = JSON.stringify({
  version: 1,
  cli: {
    packageManager: 'npm',
    schematicCollections: [],
    analytics: false,
  },
  projects: {
    'my-app': {
      projectType: 'application',
      root: '',
      sourceRoot: 'src',
      architect: {
        build: { builder: '@angular/build:application' },
        serve: { builder: '@angular/build:dev-server' },
      },
    },
  },
});

describe('lint-config', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);
  it('creates the lint config files', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expectFileExists(
      tree,
      '/.editorconfig',
      '/eslint.config.mjs',
      '/.prettierrc.json',
      '/.prettierignore',
    );
  });

  it('sets the correct indent style in .editorconfig', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expectFileContains(tree, '/.editorconfig', 'indent_style = space', 'indent_size = 2');
  });

  it('configures Angular ESLint rules in eslint.config.mjs', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expectFileContains(
      tree,
      '/eslint.config.mjs',
      'angular.configs.tsRecommended',
      'tseslint.configs.recommended',
    );
  });

  it('configures prettier settings in .prettierrc.json', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expectFileContains(tree, '/.prettierrc.json', '"singleQuote": true', '"printWidth": 100');
  });

  it('adds the lint architect target to angular.json projects', async () => {
    const initialTree = treeWithPackageJson();
    initialTree.create('/angular.json', minimalAngularJson);

    const tree = await runner.runSchematic('lint-config', {}, initialTree);

    const json = JSON.parse(tree.readText('/angular.json'));
    expect(json.projects['my-app'].architect['lint']).toBeDefined();
    expect(json.projects['my-app'].architect['lint'].builder).toBe('@angular-eslint/builder:lint');
    expect(json.projects['my-app'].architect['lint'].options.lintFilePatterns).toContain(
      'src/**/*.ts',
    );
    expect(json.projects['my-app'].architect['lint'].options.lintFilePatterns).toContain(
      'src/**/*.html',
    );
  });

  it('adds @angular-eslint/schematics to cli.schematicCollections in angular.json', async () => {
    const initialTree = treeWithPackageJson();
    initialTree.create('/angular.json', minimalAngularJson);

    const tree = await runner.runSchematic('lint-config', {}, initialTree);

    const json = JSON.parse(tree.readText('/angular.json'));
    expect(json.cli.schematicCollections).toContain('@angular-eslint/schematics');
  });

  it('does not duplicate lint target if it already exists in angular.json', async () => {
    const existingLintJson = JSON.parse(minimalAngularJson);
    existingLintJson.projects['my-app'].architect['lint'] = {
      builder: '@angular-eslint/builder:lint',
      options: { lintFilePatterns: ['src/**/*.ts'] },
    };
    const initialTree = treeWithPackageJson();
    initialTree.create('/angular.json', JSON.stringify(existingLintJson));

    const tree = await runner.runSchematic('lint-config', {}, initialTree);

    const json = JSON.parse(tree.readText('/angular.json'));
    // Should keep the existing lint config unchanged
    expect(json.projects['my-app'].architect['lint'].options.lintFilePatterns).toEqual([
      'src/**/*.ts',
    ]);
  });

  it('skips angular.json modification if the file does not exist', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expect(tree.exists('/angular.json')).toBe(false);
  });

  it('adds eslint as a dev dependency in package.json', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expectDependency(tree, 'eslint', versions.eslint, DependencyType.Dev);
  });

  it('adds angular-eslint as a dev dependency in package.json', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expectDependency(tree, 'angular-eslint', versions.angularEslint, DependencyType.Dev);
  });

  it('adds @angular-eslint/eslint-plugin as a dev dependency in package.json', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expectDependency(
      tree,
      '@angular-eslint/eslint-plugin',
      versions.angularEslint,
      DependencyType.Dev,
    );
  });

  it('adds @angular-eslint/eslint-plugin-template as a dev dependency in package.json', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expectDependency(
      tree,
      '@angular-eslint/eslint-plugin-template',
      versions.angularEslint,
      DependencyType.Dev,
    );
  });

  it('adds @angular-eslint/template-parser as a dev dependency in package.json', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expectDependency(
      tree,
      '@angular-eslint/template-parser',
      versions.angularEslint,
      DependencyType.Dev,
    );
  });

  it('adds @angular-eslint/builder as a dev dependency in package.json', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expectDependency(tree, '@angular-eslint/builder', versions.angularEslint, DependencyType.Dev);
  });

  it('adds typescript-eslint as a dev dependency in package.json', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expectDependency(tree, 'typescript-eslint', versions.typescriptEslint, DependencyType.Dev);
  });

  it('adds the lint script to package.json', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expectScript(tree, 'lint', 'ng lint');
  });

  it('adds the lint:fix script to package.json', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expectScript(tree, 'lint:fix', 'ng lint --fix');
  });

  it('does not overwrite an existing lint script in package.json', async () => {
    const tree = await runner.runSchematic(
      'lint-config',
      {},
      treeWithFile(
        'package.json',
        JSON.stringify({ name: 'test-app', scripts: { lint: 'custom lint' } }),
      ),
    );

    expectScript(tree, 'lint', 'custom lint');
  });

  it('adds prettier config to package.json', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithPackageJson());

    expectPackageJsonField(tree, ['prettier', 'printWidth'], 100);
    expectPackageJsonField(tree, ['prettier', 'singleQuote'], true);
    expectPackageJsonField(tree, ['prettier', 'overrides', 0, 'files'], '*.html');
    expectPackageJsonField(tree, ['prettier', 'overrides', 0, 'options', 'parser'], 'angular');
  });

  it('does not overwrite an existing prettier config in package.json', async () => {
    const tree = await runner.runSchematic(
      'lint-config',
      {},
      treeWithFile(
        'package.json',
        JSON.stringify({ name: 'test-app', prettier: { printWidth: 80 } }),
      ),
    );

    expectPackageJsonField(tree, ['prettier', 'printWidth'], 80);
  });

  it('skips package.json modification if the file does not exist', async () => {
    const tree = await runner.runSchematic('lint-config', {}, treeWithoutPackageJson());

    expect(tree.exists('/package.json')).toBe(false);
  });
});
