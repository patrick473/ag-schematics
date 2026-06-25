import { Rule, Tree } from '@angular-devkit/schematics';
import { JSONFile } from './json-file';

export function addScript(name: string, script: string): Rule {
  return (tree: Tree) => {
    const pkgPath = '/package.json';
    if (!tree.exists(pkgPath)) {
      return;
    }

    const json = new JSONFile(tree, pkgPath);
    if (json.get(['scripts', name]) === undefined) {
      json.modify(['scripts', name], script);
    }
  };
}
