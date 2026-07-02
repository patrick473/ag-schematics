import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { expectFileContains, expectFileExists } from '../utils/test/tree-helpers';

const collectionPath = path.join(__dirname, '../collection.json');
const templatePath = '/.azuredevops/pull_request_template.md';

describe('ado-config', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);

  it('creates the PR template file', async () => {
    const tree = await runner.runSchematic('ado-config', {}, Tree.empty());

    expectFileExists(tree, templatePath);
  });

  it('template contains a Description section', async () => {
    const tree = await runner.runSchematic('ado-config', {}, Tree.empty());

    expectFileContains(tree, templatePath, '## Description');
  });

  it('template contains a Type of Change section', async () => {
    const tree = await runner.runSchematic('ado-config', {}, Tree.empty());

    expectFileContains(tree, templatePath, '## Type of Change');
  });

  it('template contains a Checklist section', async () => {
    const tree = await runner.runSchematic('ado-config', {}, Tree.empty());

    expectFileContains(tree, templatePath, '## Checklist');
  });

  it('skips creation if file already exists', async () => {
    const firstTree = await runner.runSchematic('ado-config', {}, Tree.empty());
    const originalContent = firstTree.readText(templatePath);

    const secondTree = await runner.runSchematic('ado-config', {}, firstTree);

    expect(secondTree.readText(templatePath)).toBe(originalContent);
  });
});
