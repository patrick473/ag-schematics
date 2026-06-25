import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { versions } from '../versions';
import * as path from 'path';
import { treeWithPackageJson, expectDependency, expectScript } from '../utils/test/tree-helpers';
import { DependencyType } from '../utils/dependency';

const collectionPath = path.join(__dirname, '../collection.json');

describe('orval-config', () => {
  it('creates orval.config.ts', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('orval-config', {}, treeWithPackageJson());

    expect(tree.files).toContain('/orval.config.ts');
  });

  it('creates openapi.yaml', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('orval-config', {}, treeWithPackageJson());

    expect(tree.files).toContain('/openapi.yaml');
  });

  it('orval.config.ts contains the expected output configuration', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('orval-config', {}, treeWithPackageJson());

    const content = tree.readText('/orval.config.ts');
    expect(content).toContain("import { defineConfig } from 'orval'");
    expect(content).toContain("target: './openapi.yaml'");
    expect(content).toContain("target: './src/app/api/api-service.ts'");
    expect(content).toContain("client: 'angular'");
  });

  it('adds orval as a dev dependency in package.json', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('orval-config', {}, treeWithPackageJson());

    expectDependency(tree, 'orval', versions.orval, DependencyType.Dev);
  });

  it('does not overwrite an existing orval dependency', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('orval-config', {}, treeWithPackageJson({ orval: '7.0.0' }));

    expectDependency(tree, 'orval', '7.0.0', DependencyType.Dev);
  });

  it('adds the api:gen script to package.json', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('orval-config', {}, treeWithPackageJson());

    expectScript(tree, 'api:gen', 'orval --config orval.config.ts');
  });
});
