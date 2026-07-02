import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { versions } from '../utils/versions';
import * as path from 'node:path';
import {
  treeWithPackageJson,
  expectDependency,
  expectFileContains,
  expectFileExists,
} from '../utils/test/tree-helpers';
import { DependencyType } from '../utils/dependency';

const collectionPath = path.join(__dirname, '../collection.json');
const minimalEslintrc = JSON.stringify({
  root: true,
  plugins: [],
  overrides: [
    {
      files: ['*.ts'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {},
    },
    {
      files: ['*.html'],
      extends: ['plugin:@angular-eslint/template/recommended'],
      rules: {},
    },
  ],
});

describe('sheriff-config', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);
  it('creates sheriff.config.ts', async () => {
    const tree = await runner.runSchematic('sheriff-config', {}, treeWithPackageJson());

    expectFileExists(tree, '/sheriff.config.ts');
  });

  it('sheriff.config.ts contains the expected structure', async () => {
    const tree = await runner.runSchematic('sheriff-config', {}, treeWithPackageJson());

    expectFileContains(
      tree,
      '/sheriff.config.ts',
      "from '@softarc/sheriff-core'",
      'SheriffConfig',
      'version: 1',
      'tagging',
      'depRules',
    );
  });

  it('adds @softarc/sheriff-core as a dev dependency', async () => {
    const tree = await runner.runSchematic('sheriff-config', {}, treeWithPackageJson());

    expectDependency(tree, '@softarc/sheriff-core', versions.sheriff, DependencyType.Dev);
  });

  it('adds @softarc/eslint-plugin-sheriff as a dev dependency', async () => {
    const tree = await runner.runSchematic('sheriff-config', {}, treeWithPackageJson());

    expectDependency(tree, '@softarc/eslint-plugin-sheriff', versions.sheriff, DependencyType.Dev);
  });

  it('does not overwrite existing sheriff-core dependency', async () => {
    const tree = await runner.runSchematic(
      'sheriff-config',
      {},
      treeWithPackageJson({ '@softarc/sheriff-core': '0.1.0' }),
    );

    expectDependency(tree, '@softarc/sheriff-core', '0.1.0', DependencyType.Dev);
  });

  it('adds @softarc/sheriff to plugins in .eslintrc.json', async () => {
    const initialTree = treeWithPackageJson();
    initialTree.create('/.eslintrc.json', minimalEslintrc);

    const tree = await runner.runSchematic('sheriff-config', {}, initialTree);

    const json = JSON.parse(tree.readText('/.eslintrc.json'));
    expect(json.plugins).toContain('@softarc/sheriff');
  });

  it('adds @softarc/sheriff/dependency-rule to the TypeScript override rules', async () => {
    const initialTree = treeWithPackageJson();
    initialTree.create('/.eslintrc.json', minimalEslintrc);

    const tree = await runner.runSchematic('sheriff-config', {}, initialTree);

    const json = JSON.parse(tree.readText('/.eslintrc.json'));
    const tsOverride = json.overrides.find(
      (o: { files: string[] }) => Array.isArray(o.files) && o.files.includes('*.ts'),
    );
    expect(tsOverride.rules['@softarc/sheriff/dependency-rule']).toBe('error');
  });

  it('does not duplicate the plugin if already present', async () => {
    const initialTree = treeWithPackageJson();
    const eslintWithSheriff = JSON.stringify({
      root: true,
      plugins: ['@softarc/sheriff'],
      overrides: [
        { files: ['*.ts'], extends: [], rules: { '@softarc/sheriff/dependency-rule': 'error' } },
      ],
    });
    initialTree.create('/.eslintrc.json', eslintWithSheriff);

    const tree = await runner.runSchematic('sheriff-config', {}, initialTree);

    const json = JSON.parse(tree.readText('/.eslintrc.json'));
    const sheriffPlugins = json.plugins.filter((p: string) => p === '@softarc/sheriff');
    expect(sheriffPlugins).toHaveLength(1);
  });

  it('skips ESLint update when .eslintrc.json does not exist', async () => {
    const tree = await runner.runSchematic('sheriff-config', {}, treeWithPackageJson());

    expect(tree.files).not.toContain('/.eslintrc.json');
  });

  it('does not overwrite an existing sheriff.config.ts', async () => {
    const initialTree = treeWithPackageJson();
    const existingConfig = `// existing config\nexport default {};\n`;
    initialTree.create('/sheriff.config.ts', existingConfig);

    const tree = await runner.runSchematic('sheriff-config', {}, initialTree);

    expect(tree.readText('/sheriff.config.ts')).toBe(existingConfig);
  });
});
