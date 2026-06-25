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
import { addScript } from '../utils/script';

interface K8sConfigOptions {
  applicationName: string;
  namespace: string;
  port: number;
  replicas: number;
  ingressHost: string;
}

export function k8sConfig(options: K8sConfigOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        ...strings,
        ...options,
      }),
      move(''),
      filter(path => !tree.exists(path)),
    ]);
    return chain([
      addScript('k8s:apply', 'kubectl apply -f k8s/'),
      mergeWith(sourceParametrizedTemplates),
    ])(tree, _context);
  };
}
