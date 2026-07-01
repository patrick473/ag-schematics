import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import { expectFileContains, expectFileExists, treeWithFile } from '../utils/test/tree-helpers';

const collectionPath = path.join(__dirname, '../collection.json');

describe('adr', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);

  it('creates the ADR file in the default adr directory', async () => {
    const tree = await runner.runSchematic(
      'adr',
      { title: 'Use PostgreSQL', number: '0001' },
      Tree.empty(),
    );

    expectFileExists(tree, '/adr/0001-use-postgre-sql.md');
  });

  it('creates the ADR file in a custom directory', async () => {
    const tree = await runner.runSchematic(
      'adr',
      { title: 'Use PostgreSQL', number: '0001', directory: 'docs/decisions' },
      Tree.empty(),
    );

    expectFileExists(tree, '/docs/decisions/0001-use-postgre-sql.md');
  });

  it('dasherizes the title in the filename', async () => {
    const tree = await runner.runSchematic(
      'adr',
      { title: 'Adopt Event Sourcing', number: '0002' },
      Tree.empty(),
    );

    expectFileExists(tree, '/adr/0002-adopt-event-sourcing.md');
  });

  it('includes the ADR number and title in the file content', async () => {
    const tree = await runner.runSchematic(
      'adr',
      { title: 'Adopt Event Sourcing', number: '0002' },
      Tree.empty(),
    );

    expectFileContains(tree, '/adr/0002-adopt-event-sourcing.md', '# 0002. Adopt Event Sourcing');
  });

  it('includes a date in the file content', async () => {
    const tree = await runner.runSchematic(
      'adr',
      { title: 'Use PostgreSQL', number: '0001' },
      Tree.empty(),
    );

    const content = tree.readText('/adr/0001-use-postgre-sql.md');
    expect(content).toMatch(/Date: \d{4}-\d{2}-\d{2}/);
  });

  it('includes the standard ADR sections', async () => {
    const tree = await runner.runSchematic(
      'adr',
      { title: 'Use PostgreSQL', number: '0001' },
      Tree.empty(),
    );

    expectFileContains(
      tree,
      '/adr/0001-use-postgre-sql.md',
      '## Status',
      '## Context',
      '## Decision',
      '## Consequences',
    );
  });

  it('uses default values when none are provided', async () => {
    const tree = await runner.runSchematic('adr', {}, Tree.empty());

    expectFileExists(tree, '/adr/0001-my-decision.md');
  });

  it('skips creation when an ADR with the same number already exists', async () => {
    const tree = await runner.runSchematic(
      'adr',
      { title: 'Use PostgreSQL', number: '0001' },
      treeWithFile('/adr/0001-existing-decision.md', '# existing'),
    );

    expect(tree.files).toEqual(['/adr/0001-existing-decision.md']);
  });

  it('skips creation when the ADR number is not a valid number', async () => {
    const tree = await runner.runSchematic(
      'adr',
      { title: 'Use PostgreSQL', number: 'abc' },
      Tree.empty(),
    );

    expect(tree.files).toEqual([]);
  });
});
