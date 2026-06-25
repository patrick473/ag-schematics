import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('gitignore-config', () => {
  it('creates the .gitignore file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'gitignore-config',
      {},
      Tree.empty()
    );

    expect(tree.files).toContain('/.gitignore');
  });

  it('.gitignore contains node_modules entry', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'gitignore-config',
      {},
      Tree.empty()
    );

    const content = tree.readText('/.gitignore');
    expect(content).toContain('/node_modules');
  });

  it('.gitignore contains dist entry', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'gitignore-config',
      {},
      Tree.empty()
    );

    const content = tree.readText('/.gitignore');
    expect(content).toContain('/dist');
  });

  it('.gitignore contains Angular cache entry', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'gitignore-config',
      {},
      Tree.empty()
    );

    const content = tree.readText('/.gitignore');
    expect(content).toContain('/.angular/cache');
  });
});
