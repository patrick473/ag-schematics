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
  return (tree: Tree, _context: SchematicContext) => {
    const slug = strings.dasherize(options.title);
    const date = new Date().toISOString().split('T')[0];

    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        ...strings,
        ...options,
        slug,
        date,
      }),
      move(options.directory),
    ]);
    return mergeWith(sourceParametrizedTemplates)(tree, _context);
  };
}
