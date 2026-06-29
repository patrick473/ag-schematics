import { strings } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  applyTemplates,
  chain,
  filter,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';
import { JSONFile } from '../utils/json-file';
import { installDevDependency } from '../utils/dependency-shortcuts';
import { versions } from '../utils/versions';

interface SheriffConfigOptions {}

function updateEslintConfig(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const eslintPath = '/.eslintrc.json';
    if (!tree.exists(eslintPath)) {
      context.logger.warn(
        '.eslintrc.json not found. Skipping ESLint configuration. Run lint-config first or add Sheriff rules manually.',
      );
      return;
    }

    const json = new JSONFile(tree, eslintPath);

    // Add @softarc/sheriff to plugins array
    const plugins = (json.get(['plugins']) as string[] | undefined) ?? [];
    if (!plugins.includes('@softarc/sheriff')) {
      json.modify(['plugins', plugins.length], '@softarc/sheriff');
    }

    // Add dependency-rule to the TS override's rules
    const overrides = (json.get(['overrides']) as Record<string, unknown>[] | undefined) ?? [];
    const tsOverrideIndex = overrides.findIndex((override) => {
      const files = override['files'];
      return Array.isArray(files) && files.includes('*.ts');
    });

    if (tsOverrideIndex !== -1) {
      const rulePath = ['overrides', tsOverrideIndex, 'rules', '@softarc/sheriff/dependency-rule'];
      if (json.get(rulePath) === undefined) {
        json.modify(rulePath, 'error');
      }
    }
  };
}

export function sheriffConfig(options: SheriffConfigOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        ...strings,
        ...options,
      }),
      filter((path) => !tree.exists(path)),
      move(''),
    ]);
    return chain([
      installDevDependency('@softarc/sheriff-core', versions.sheriff),
      installDevDependency('@softarc/eslint-plugin-sheriff', versions.sheriff),
      updateEslintConfig(),
      mergeWith(sourceParametrizedTemplates),
    ])(tree, context);
  };
}
