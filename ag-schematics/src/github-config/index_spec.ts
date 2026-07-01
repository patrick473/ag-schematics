import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';

const collectionPath = path.join(__dirname, '../collection.json');

const defaultOptions = {
  defaultBranch: 'main',
  nodeVersion: '20',
};

describe('github-config', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);  
  it('creates all GitHub config files', async () => {
    const tree = await runner.runSchematic('github-config', defaultOptions, Tree.empty());

    expect(tree.files).toContain('/.github/pull_request_template.md');
    expect(tree.files).toContain('/.github/ISSUE_TEMPLATE/bug_report.md');
    expect(tree.files).toContain('/.github/ISSUE_TEMPLATE/feature_request.md');
    expect(tree.files).toContain('/.github/workflows/ci.yml');
    expect(tree.files).toContain('/.github/workflows/codeql.yml');
    expect(tree.files).toContain('/.github/dependabot.yml');
  });

  it('PR template contains Description, Type of Change, and Checklist sections', async () => {
    const tree = await runner.runSchematic('github-config', defaultOptions, Tree.empty());
    const content = tree.readText('/.github/pull_request_template.md');

    expect(content).toContain('## Description');
    expect(content).toContain('## Type of Change');
    expect(content).toContain('## Checklist');
  });

  it('bug report template contains required fields', async () => {
    const tree = await runner.runSchematic('github-config', defaultOptions, Tree.empty());
    const content = tree.readText('/.github/ISSUE_TEMPLATE/bug_report.md');

    expect(content).toContain('## Steps to Reproduce');
    expect(content).toContain('## Expected Behaviour');
    expect(content).toContain('## Actual Behaviour');
    expect(content).toContain('## Environment');
  });

  it('feature request template contains required sections', async () => {
    const tree = await runner.runSchematic('github-config', defaultOptions, Tree.empty());
    const content = tree.readText('/.github/ISSUE_TEMPLATE/feature_request.md');

    expect(content).toContain('## Problem Description');
    expect(content).toContain('## Proposed Solution');
    expect(content).toContain('## Alternatives');
  });

  it('ci.yml uses the defaultBranch', async () => {
    const tree = await runner.runSchematic(
      'github-config',
      { ...defaultOptions, defaultBranch: 'develop' },
      Tree.empty(),
    );
    const content = tree.readText('/.github/workflows/ci.yml');

    expect(content).toContain('develop');
  });

  it('ci.yml uses the nodeVersion', async () => {
    const tree = await runner.runSchematic(
      'github-config',
      { ...defaultOptions, nodeVersion: '22' },
      Tree.empty(),
    );
    const content = tree.readText('/.github/workflows/ci.yml');

    expect(content).toContain("'22'");
  });

  it('codeql.yml uses the defaultBranch', async () => {
    const tree = await runner.runSchematic(
      'github-config',
      { ...defaultOptions, defaultBranch: 'develop' },
      Tree.empty(),
    );
    const content = tree.readText('/.github/workflows/codeql.yml');

    expect(content).toContain('develop');
  });

  it('codeql.yml contains required CodeQL actions and javascript language', async () => {
    const tree = await runner.runSchematic('github-config', defaultOptions, Tree.empty());
    const content = tree.readText('/.github/workflows/codeql.yml');

    expect(content).toContain('github/codeql-action/init@v3');
    expect(content).toContain('github/codeql-action/autobuild@v3');
    expect(content).toContain('github/codeql-action/analyze@v3');
    expect(content).toContain("'javascript'");
    expect(content).toContain('security-events: write');
  });

  it('dependabot.yml uses the defaultBranch', async () => {
    const tree = await runner.runSchematic(
      'github-config',
      { ...defaultOptions, defaultBranch: 'develop' },
      Tree.empty(),
    );
    const content = tree.readText('/.github/dependabot.yml');

    expect(content).toContain('target-branch: develop');
  });

  it('uses defaults when no options are provided', async () => {
    const tree = await runner.runSchematic('github-config', {}, Tree.empty());

    expect(tree.files).toContain('/.github/workflows/ci.yml');
    expect(tree.files).toContain('/.github/workflows/codeql.yml');
    expect(tree.files).toContain('/.github/dependabot.yml');

    const ci = tree.readText('/.github/workflows/ci.yml');
    expect(ci).toContain('main');
    expect(ci).toContain("'20'");

    const dependabot = tree.readText('/.github/dependabot.yml');
    expect(dependabot).toContain('target-branch: main');
  });

  it('skips existing files and does not overwrite them', async () => {
    const initialTree = Tree.empty();
    initialTree.create('/.github/pull_request_template.md', 'existing content');

    const tree = await runner.runSchematic('github-config', defaultOptions, initialTree);

    expect(tree.readText('/.github/pull_request_template.md')).toBe('existing content');
  });
});
