import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('npm-config', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);
  it('creates the npm config files', async () => {
    const tree = await runner.runSchematic('npm-config', {}, Tree.empty());

    expect(tree.files).toContain('/.nvmrc');
  });

  it('sets the node version in .nvmrc', async () => {
    const tree = await runner.runSchematic('npm-config', {}, Tree.empty());

    const content = tree.readText('/.nvmrc');
    expect(content).toContain('v24.16.0');
  });
});
