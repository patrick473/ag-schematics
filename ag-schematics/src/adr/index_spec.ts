import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('adr', () => {
  it('creates the ADR file in the default adr directory', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'adr',
      { title: 'Use PostgreSQL', number: '0001' },
      Tree.empty(),
    );

    expect(tree.files).toContain('/adr/0001-use-postgre-sql.md');
  });

  it('creates the ADR file in a custom directory', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'adr',
      { title: 'Use PostgreSQL', number: '0001', directory: 'docs/decisions' },
      Tree.empty(),
    );

    expect(tree.files).toContain('/docs/decisions/0001-use-postgre-sql.md');
  });

  it('dasherizes the title in the filename', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'adr',
      { title: 'Adopt Event Sourcing', number: '0002' },
      Tree.empty(),
    );

    expect(tree.files).toContain('/adr/0002-adopt-event-sourcing.md');
  });

  it('includes the ADR number and title in the file content', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'adr',
      { title: 'Adopt Event Sourcing', number: '0002' },
      Tree.empty(),
    );

    const content = tree.readText('/adr/0002-adopt-event-sourcing.md');
    expect(content).toContain('# 0002. Adopt Event Sourcing');
  });

  it('includes a date in the file content', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'adr',
      { title: 'Use PostgreSQL', number: '0001' },
      Tree.empty(),
    );

    const content = tree.readText('/adr/0001-use-postgre-sql.md');
    expect(content).toMatch(/Date: \d{4}-\d{2}-\d{2}/);
  });

  it('includes the standard ADR sections', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'adr',
      { title: 'Use PostgreSQL', number: '0001' },
      Tree.empty(),
    );

    const content = tree.readText('/adr/0001-use-postgre-sql.md');
    expect(content).toContain('## Status');
    expect(content).toContain('## Context');
    expect(content).toContain('## Decision');
    expect(content).toContain('## Consequences');
  });

  it('uses default values when none are provided', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('adr', {}, Tree.empty());

    expect(tree.files).toContain('/adr/0001-my-decision.md');
  });
});
