import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import { expectFileContains, expectFileExists, treeWithFile } from '../utils/test/tree-helpers';

const collectionPath = path.join(__dirname, '../collection.json');

const minimalAppModule = `import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
`;

describe('dynamic-app-config', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);
  it('creates the app-config.json asset', async () => {
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expectFileExists(tree, '/src/assets/app-config.json');
  });

  it('app-config.json contains apiUrl field', async () => {
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    const content = tree.readText('/src/assets/app-config.json');
    expect(JSON.parse(content)).toEqual({ apiUrl: '' });
  });

  it('creates app-config.model.ts', async () => {
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expectFileExists(tree, '/src/app/core/app-config.model.ts');
  });

  it('app-config.model.ts exports AppConfig interface with apiUrl', async () => {
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expectFileContains(
      tree,
      '/src/app/core/app-config.model.ts',
      'export interface AppConfig',
      'apiUrl: string',
    );
  });

  it('creates app-config.service.ts', async () => {
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expectFileExists(tree, '/src/app/core/app-config.service.ts');
  });

  it('app-config.service.ts has Injectable decorator and config getter', async () => {
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expectFileContains(
      tree,
      '/src/app/core/app-config.service.ts',
      "@Injectable({ providedIn: 'root' })",
      'AppConfigService',
      'get config()',
    );
  });

  it('creates app-initializer.ts', async () => {
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expectFileExists(tree, '/src/app/app-initializer.ts');
  });

  it('app-initializer.ts uses the default configPath', async () => {
    const tree = await runner.runSchematic(
      'dynamic-app-config',
      { configPath: 'assets/app-config.json' },
      Tree.empty(),
    );

    expectFileContains(tree, '/src/app/app-initializer.ts', 'assets/app-config.json');
  });

  it('app-initializer.ts uses a custom configPath', async () => {
    const tree = await runner.runSchematic(
      'dynamic-app-config',
      { configPath: 'assets/custom-config.json' },
      Tree.empty(),
    );

    expectFileContains(tree, '/src/app/app-initializer.ts', 'assets/custom-config.json');
  });

  it('app-initializer.ts exports appInitializer function', async () => {
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expectFileContains(tree, '/src/app/app-initializer.ts', 'export function appInitializer');
  });

  it('app-initializer.ts returns a Promise-returning function', async () => {
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expectFileContains(tree, '/src/app/app-initializer.ts', 'Promise<void>');
  });

  it('modifies app.module.ts to add HttpClientModule import', async () => {
    const tree = await runner.runSchematic(
      'dynamic-app-config',
      {},
      treeWithFile('/src/app/app.module.ts', minimalAppModule),
    );

    expectFileContains(tree, '/src/app/app.module.ts', "from '@angular/common/http'");
  });

  it('modifies app.module.ts to add HttpClientModule to imports array', async () => {
    const tree = await runner.runSchematic(
      'dynamic-app-config',
      {},
      treeWithFile('/src/app/app.module.ts', minimalAppModule),
    );

    expectFileContains(tree, '/src/app/app.module.ts', 'HttpClientModule');
  });

  it('modifies app.module.ts to add APP_INITIALIZER provider', async () => {
    const tree = await runner.runSchematic(
      'dynamic-app-config',
      {},
      treeWithFile('/src/app/app.module.ts', minimalAppModule),
    );

    expectFileContains(
      tree,
      '/src/app/app.module.ts',
      'APP_INITIALIZER',
      'appInitializer',
      'multi: true',
    );
  });

  it('modifies app.module.ts to set useFactory to appInitializer', async () => {
    const tree = await runner.runSchematic(
      'dynamic-app-config',
      {},
      treeWithFile('/src/app/app.module.ts', minimalAppModule),
    );

    expectFileContains(tree, '/src/app/app.module.ts', 'useFactory: appInitializer');
  });

  it('modifies app.module.ts to include HttpClient and AppConfigService in deps', async () => {
    const tree = await runner.runSchematic(
      'dynamic-app-config',
      {},
      treeWithFile('/src/app/app.module.ts', minimalAppModule),
    );

    expectFileContains(tree, '/src/app/app.module.ts', 'HttpClient', 'AppConfigService');
  });

  it('is idempotent for app.module.ts when appInitializer already referenced', async () => {
    const alreadyModified = minimalAppModule + '\n// already references appInitializer\n';
    const tree = await runner.runSchematic(
      'dynamic-app-config',
      {},
      treeWithFile('/src/app/app.module.ts', alreadyModified),
    );

    const content = tree.readText('/src/app/app.module.ts');
    const count = (content.match(/appInitializer/g) ?? []).length;
    expect(count).toBe(1);
  });

  it('appends comment to environment.ts', async () => {
    const tree = await runner.runSchematic(
      'dynamic-app-config',
      {},
      treeWithFile(
        '/src/environments/environment.ts',
        'export const environment = { production: false };\n',
      ),
    );

    expectFileContains(
      tree,
      '/src/environments/environment.ts',
      'Dynamic config is loaded at runtime via AppConfigService',
    );
  });

  it('does not duplicate comment in environment.ts on re-run', async () => {
    const comment =
      '// Dynamic config is loaded at runtime via AppConfigService. Avoid hardcoding API URLs here.';
    const tree = await runner.runSchematic(
      'dynamic-app-config',
      {},
      treeWithFile(
        '/src/environments/environment.ts',
        `export const environment = {};\n${comment}\n`,
      ),
    );

    const content = tree.readText('/src/environments/environment.ts');
    const count = (content.match(/Dynamic config is loaded/g) ?? []).length;
    expect(count).toBe(1);
  });

  it('skips generating a file that already exists', async () => {
    const tree = await runner.runSchematic(
      'dynamic-app-config',
      {},
      treeWithFile('/src/assets/app-config.json', '{"apiUrl":"existing"}'),
    );

    expect(tree.readText('/src/assets/app-config.json')).toBe('{"apiUrl":"existing"}');
  });

  it('does not create app.module.ts if it does not exist', async () => {
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expect(tree.files).not.toContain('/src/app/app.module.ts');
  });

  it('does not modify environment.ts if it does not exist', async () => {
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expect(tree.files).not.toContain('/src/environments/environment.ts');
  });
});
