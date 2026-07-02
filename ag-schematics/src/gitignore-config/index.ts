import {
  MergeStrategy,
  Rule,
  SchematicContext,
  Tree,
  apply,
  applyTemplates,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';

interface GitignoreConfigOptions {}

export function gitignoreConfig(options: GitignoreConfigOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        ...options,
      }),
      move(''),
    ]);
    return mergeWith(sourceParametrizedTemplates, MergeStrategy.Error)(tree, _context);
  };
}
