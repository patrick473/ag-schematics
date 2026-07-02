import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { expectFileContains, expectFileExists } from '../utils/test/tree-helpers';

const collectionPath = path.join(__dirname, '../collection.json');

describe('gitignore-config', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);

  it('creates the .gitignore file', async () => {
    const tree = await runner.runSchematic('gitignore-config', {}, Tree.empty());

    expectFileExists(tree, '/.gitignore');
  });

  it('.gitignore contains node_modules entry', async () => {
    const tree = await runner.runSchematic('gitignore-config', {}, Tree.empty());

    expectFileContains(tree, '/.gitignore', '/node_modules');
  });

  it('.gitignore contains dist entry', async () => {
    const tree = await runner.runSchematic('gitignore-config', {}, Tree.empty());

    expectFileContains(tree, '/.gitignore', '/dist');
  });

  it('.gitignore contains Angular cache entry', async () => {
    const tree = await runner.runSchematic('gitignore-config', {}, Tree.empty());

    expectFileContains(tree, '/.gitignore', '/.angular/cache');
  });
});
