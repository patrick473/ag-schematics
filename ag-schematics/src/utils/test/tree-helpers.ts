import { Tree } from '@angular-devkit/schematics';
import { DependencyType } from '../dependency';
import { JSONFile, JSONPath } from '../json-file';

export function treeWithPackageJson(devDependencies: Record<string, string> = {}): Tree {
  const tree = Tree.empty();
  tree.create('package.json', JSON.stringify({ name: 'test-app', devDependencies }));
  return tree;
}
export function treeWithoutPackageJson(): Tree {
  const tree = Tree.empty();
  tree.create('some-file.txt', 'some content');
  return tree;
}

export function expectScript(tree: Tree, name: string, value: string): void {
  const pkg = JSON.parse(tree.readText('/package.json'));
  expect(pkg.scripts?.[name]).toBe(value);
}

export function expectNoScript(tree: Tree, name: string): void {
  const pkg = JSON.parse(tree.readText('/package.json'));
  expect(pkg.scripts?.[name]).toBeUndefined();
}

export function expectDependency(
  tree: Tree,
  name: string,
  version: string,
  type = DependencyType.Default,
): void {
  const pkg = JSON.parse(tree.readText('/package.json'));
  expect(pkg[type]?.[name]).toBe(version);
}

export function expectNoDependency(tree: Tree, name: string, type = DependencyType.Default): void {
  const pkg = JSON.parse(tree.readText('/package.json'));
  expect(pkg[type]?.[name]).toBeUndefined();
}

export function expectPackageJsonField(tree: Tree, jsonPath: JSONPath, value: unknown): void {
  const json = new JSONFile(tree, '/package.json');
  expect(json.get(jsonPath)).toEqual(value);
}
