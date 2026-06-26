import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../../collection.json');

describe('header', () => {
  it('creates the component files', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('header', {}, Tree.empty());

    expect(tree.files).toContain('/src/app/components/common/header/header.ts');
    expect(tree.files).toContain('/src/app/components/common/header/header.html');
    expect(tree.files).toContain('/src/app/components/common/header/header.scss');
  });

  it('generates a component with the correct class name', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('header', {}, Tree.empty());

    const tsContent = tree.readText('/src/app/components/common/header/header.ts');
    expect(tsContent).toContain('export class Header');
    expect(tsContent).toContain("selector: 'pr-header'");
  });

  it('generates a component with a button in the template', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('header', {}, Tree.empty());

    const htmlContent = tree.readText('/src/app/components/common/header/header.html');
    expect(htmlContent).toContain('<mat-toolbar class="toolbar">');
  });

  it('respects a custom path option', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('header', { path: 'src/features' }, Tree.empty());

    expect(tree.files).toContain('/src/features/header/header.ts');
    expect(tree.files).toContain('/src/features/header/header.html');
    expect(tree.files).toContain('/src/features/header/header.scss');
  });
});
