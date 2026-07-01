import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import { expectFileContains, expectFileExists } from '../utils/test/tree-helpers';

const collectionPath = path.join(__dirname, '../collection.json');

describe('npm-config', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);
  it('creates the npm config files', async () => {
    const tree = await runner.runSchematic('npm-config', {}, Tree.empty());

    expectFileExists(tree, '/.nvmrc');
  });

  it('sets the node version in .nvmrc', async () => {
    const tree = await runner.runSchematic('npm-config', {}, Tree.empty());

    expectFileContains(tree, '/.nvmrc', 'v24.16.0');
  });
});
