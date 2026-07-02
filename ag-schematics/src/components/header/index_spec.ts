import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import { expectFileContains, expectFileExists } from '../../utils/test/tree-helpers';

const collectionPath = path.join(__dirname, '../../collection.json');

describe('header', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);
  it('creates the component files', async () => {
    const tree = await runner.runSchematic('header', {}, Tree.empty());

    expectFileExists(
      tree,
      '/src/app/components/common/header/header.ts',
      '/src/app/components/common/header/header.html',
      '/src/app/components/common/header/header.scss',
    );
  });

  it('generates a component with the correct class name', async () => {
    const tree = await runner.runSchematic('header', {}, Tree.empty());

    expectFileContains(
      tree,
      '/src/app/components/common/header/header.ts',
      'export class Header',
      "selector: 'pr-header'",
    );
  });

  it('generates a component with a button in the template', async () => {
    const tree = await runner.runSchematic('header', {}, Tree.empty());

    expectFileContains(
      tree,
      '/src/app/components/common/header/header.html',
      '<mat-toolbar class="toolbar">',
    );
  });

  it('respects a custom path option', async () => {
    const tree = await runner.runSchematic('header', { path: 'src/features' }, Tree.empty());

    expectFileExists(
      tree,
      '/src/features/header/header.ts',
      '/src/features/header/header.html',
      '/src/features/header/header.scss',
    );
  });
});
