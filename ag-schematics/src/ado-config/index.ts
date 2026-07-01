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

interface AdoConfigOptions {}

export function adoConfig(options: AdoConfigOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const templatePath = '/.azuredevops/pull_request_template.md';
    if (tree.exists(templatePath)) {
      context.logger.warn(`${templatePath} already exists. Skipping.`);
      return tree;
    }

    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        ...options,
      }),
      move(''),
    ]);
    return mergeWith(sourceParametrizedTemplates)(tree, context);
  };
}
