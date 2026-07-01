import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { versions } from '../utils/versions';
import * as path from 'node:path';
import {
  treeWithPackageJson,
  expectDependency,
  expectScript,
  expectFileContains,
  expectFileExists,
} from '../utils/test/tree-helpers';
import { DependencyType } from '../utils/dependency';

const collectionPath = path.join(__dirname, '../collection.json');

describe('orval-config', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);

  it('creates orval.config.ts', async () => {
    const tree = await runner.runSchematic('orval-config', {}, treeWithPackageJson());

    expectFileExists(tree, '/orval.config.ts');
  });

  it('creates openapi.yaml', async () => {
    const tree = await runner.runSchematic('orval-config', {}, treeWithPackageJson());

    expectFileExists(tree, '/openapi.yaml');
  });

  it('orval.config.ts contains the expected output configuration', async () => {
    const tree = await runner.runSchematic('orval-config', {}, treeWithPackageJson());

    expectFileContains(
      tree,
      '/orval.config.ts',
      "import { defineConfig } from 'orval'",
      "target: './openapi.yaml'",
      "target: './src/app/api/api-service.ts'",
      "client: 'angular'",
    );
  });

  it('adds orval as a dev dependency in package.json', async () => {
    const tree = await runner.runSchematic('orval-config', {}, treeWithPackageJson());

    expectDependency(tree, 'orval', versions.orval, DependencyType.Dev);
  });

  it('does not overwrite an existing orval dependency', async () => {
    const tree = await runner.runSchematic(
      'orval-config',
      {},
      treeWithPackageJson({ orval: '7.0.0' }),
    );

    expectDependency(tree, 'orval', '7.0.0', DependencyType.Dev);
  });

  it('adds the api:gen script to package.json', async () => {
    const tree = await runner.runSchematic('orval-config', {}, treeWithPackageJson());

    expectScript(tree, 'api:gen', 'orval --config orval.config.ts');
  });
});
