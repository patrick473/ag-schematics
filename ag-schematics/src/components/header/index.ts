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

interface HeaderComponentOptions {
  path?: string;
}

export function header(options: HeaderComponentOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        ...strings,
        ...options,
      }),
      move(options.path ?? 'src/app/components/common'),
    ]);
    return mergeWith(sourceParametrizedTemplates)(tree, _context);
  };
}
