import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import { expectFileContains, expectFileExists, treeWithFile } from '../utils/test/tree-helpers';

const collectionPath = path.join(__dirname, '../collection.json');

const defaultOptions = {
  defaultBranch: 'main',
  nodeVersion: '20',
};

describe('github-config', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);
  it('creates all GitHub config files', async () => {
    const tree = await runner.runSchematic('github-config', defaultOptions, Tree.empty());

    expectFileExists(
      tree,
      '/.github/pull_request_template.md',
      '/.github/ISSUE_TEMPLATE/bug_report.md',
      '/.github/ISSUE_TEMPLATE/feature_request.md',
      '/.github/workflows/ci.yml',
      '/.github/workflows/codeql.yml',
      '/.github/dependabot.yml',
    );
  });

  it('PR template contains Description, Type of Change, and Checklist sections', async () => {
    const tree = await runner.runSchematic('github-config', defaultOptions, Tree.empty());
    expectFileContains(
      tree,
      '/.github/pull_request_template.md',
      '## Description',
      '## Type of Change',
      '## Checklist',
    );
  });

  it('bug report template contains required fields', async () => {
    const tree = await runner.runSchematic('github-config', defaultOptions, Tree.empty());
    expectFileContains(
      tree,
      '/.github/ISSUE_TEMPLATE/bug_report.md',
      '## Steps to Reproduce',
      '## Expected Behaviour',
      '## Actual Behaviour',
      '## Environment',
    );
  });

  it('feature request template contains required sections', async () => {
    const tree = await runner.runSchematic('github-config', defaultOptions, Tree.empty());
    expectFileContains(
      tree,
      '/.github/ISSUE_TEMPLATE/feature_request.md',
      '## Problem Description',
      '## Proposed Solution',
      '## Alternatives',
    );
  });

  it('ci.yml uses the defaultBranch', async () => {
    const tree = await runner.runSchematic(
      'github-config',
      { ...defaultOptions, defaultBranch: 'develop' },
      Tree.empty(),
    );
    expectFileContains(tree, '/.github/workflows/ci.yml', 'develop');
  });

  it('ci.yml uses the nodeVersion', async () => {
    const tree = await runner.runSchematic(
      'github-config',
      { ...defaultOptions, nodeVersion: '22' },
      Tree.empty(),
    );
    expectFileContains(tree, '/.github/workflows/ci.yml', "'22'");
  });

  it('codeql.yml uses the defaultBranch', async () => {
    const tree = await runner.runSchematic(
      'github-config',
      { ...defaultOptions, defaultBranch: 'develop' },
      Tree.empty(),
    );
    expectFileContains(tree, '/.github/workflows/codeql.yml', 'develop');
  });

  it('codeql.yml contains required CodeQL actions and javascript language', async () => {
    const tree = await runner.runSchematic('github-config', defaultOptions, Tree.empty());
    expectFileContains(
      tree,
      '/.github/workflows/codeql.yml',
      'github/codeql-action/init@v3',
      'github/codeql-action/autobuild@v3',
      'github/codeql-action/analyze@v3',
      "'javascript'",
      'security-events: write',
    );
  });

  it('dependabot.yml uses the defaultBranch', async () => {
    const tree = await runner.runSchematic(
      'github-config',
      { ...defaultOptions, defaultBranch: 'develop' },
      Tree.empty(),
    );
    expectFileContains(tree, '/.github/dependabot.yml', 'target-branch: develop');
  });

  it('uses defaults when no options are provided', async () => {
    const tree = await runner.runSchematic('github-config', {}, Tree.empty());

    expectFileExists(
      tree,
      '/.github/workflows/ci.yml',
      '/.github/workflows/codeql.yml',
      '/.github/dependabot.yml',
    );
    expectFileContains(tree, '/.github/workflows/ci.yml', 'main', "'20'");
    expectFileContains(tree, '/.github/dependabot.yml', 'target-branch: main');
  });

  it('skips existing files and does not overwrite them', async () => {
    const tree = await runner.runSchematic(
      'github-config',
      defaultOptions,
      treeWithFile('/.github/pull_request_template.md', 'existing content'),
    );

    expect(tree.readText('/.github/pull_request_template.md')).toBe('existing content');
  });
});
