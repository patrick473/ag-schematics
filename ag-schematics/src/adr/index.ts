import { strings } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  applyTemplates,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';

interface AdrOptions {
  title: string;
  number: string;
  directory: string;
}

export function adr(options: AdrOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const dir = tree.getDir(options.directory);
    const existing = dir.subfiles.find((f) => f.startsWith(`${options.number}-`));
    if (existing) {
      context.logger.warn(
        `ADR number ${options.number} already exists (${options.directory}/${existing}). Skipping.`,
      );
      return tree;
    }

    const numberIsNumber = /^\d+$/.test(options.number);
    if (!numberIsNumber) {
      context.logger.warn(`ADR number ${options.number} is not a valid number. Skipping.`);
      return tree;
    }
    const slug = strings.dasherize(options.title);
    const date = new Date().toISOString().split('T')[0];

    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        ...options,
        slug,
        date,
      }),
      move(options.directory),
    ]);
    return mergeWith(sourceParametrizedTemplates)(tree, context);
  };
}
