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

interface DockerConfigOptions {
  applicationName: string;
  backendName: string;
  port: number;
}

export function dockerConfig(options: DockerConfigOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        ...strings,
        ...options,
        backend_name: options.backendName,
      }),
      move(''),
    ]);
    return mergeWith(sourceParametrizedTemplates)(tree, _context);
  };
}
