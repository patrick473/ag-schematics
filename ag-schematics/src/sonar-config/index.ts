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

interface SonarConfigOptions {
    projectKey: string;
    projectName: string;
    organization: string;
}

export function sonarConfig(options: SonarConfigOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        ...strings,
        ...options,
      }),
      move(''),
    ]);
    return mergeWith(sourceParametrizedTemplates)(tree, _context);
  };
}
