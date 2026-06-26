import { strings } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  applyTemplates,
  filter,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';

interface GithubConfigOptions {
  defaultBranch: string;
  nodeVersion: string;
}

const TARGET_FILES = [
  '/.github/pull_request_template.md',
  '/.github/ISSUE_TEMPLATE/bug_report.md',
  '/.github/ISSUE_TEMPLATE/feature_request.md',
  '/.github/workflows/ci.yml',
  '/.github/workflows/codeql.yml',
  '/.github/dependabot.yml',
];

export function githubConfig(options: GithubConfigOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    for (const filePath of TARGET_FILES) {
      if (tree.exists(filePath)) {
        context.logger.warn(`${filePath} already exists. Skipping.`);
      }
    }

    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        ...strings,
        ...options,
      }),
      filter(path => !tree.exists(path)),
      move(''),
    ]);
    return mergeWith(sourceParametrizedTemplates)(tree, context);
  };
}
