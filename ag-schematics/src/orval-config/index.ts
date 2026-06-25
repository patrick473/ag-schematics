import { strings } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';
import { versions } from '../versions';
import { installDevDependency } from '../utils/dependency-shortcuts';
import { addScript } from '../utils/script';

interface OrvalConfigOptions {
}

export function orvalConfig(options: OrvalConfigOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        ...strings,
        ...options,
      }),
      move(''),
    ]);
    return chain([
        installDevDependency('orval', versions.orval),
        addScript('api:gen', 'orval --config orval.config.ts'),
        mergeWith(sourceParametrizedTemplates)
    ])(tree, _context);
  };
}
