import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

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
  it('creates the app-config.json asset', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expect(tree.files).toContain('/src/assets/app-config.json');
  });

  it('app-config.json contains apiUrl field', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    const content = tree.readText('/src/assets/app-config.json');
    expect(JSON.parse(content)).toEqual({ apiUrl: '' });
  });

  it('creates app-config.model.ts', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expect(tree.files).toContain('/src/app/core/app-config.model.ts');
  });

  it('app-config.model.ts exports AppConfig interface with apiUrl', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    const content = tree.readText('/src/app/core/app-config.model.ts');
    expect(content).toContain('export interface AppConfig');
    expect(content).toContain('apiUrl: string');
  });

  it('creates app-config.service.ts', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expect(tree.files).toContain('/src/app/core/app-config.service.ts');
  });

  it('app-config.service.ts has Injectable decorator and config getter', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    const content = tree.readText('/src/app/core/app-config.service.ts');
    expect(content).toContain("@Injectable({ providedIn: 'root' })");
    expect(content).toContain('AppConfigService');
    expect(content).toContain('get config()');
  });

  it('creates app-initializer.ts', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expect(tree.files).toContain('/src/app/app-initializer.ts');
  });

  it('app-initializer.ts uses the default configPath', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'dynamic-app-config',
      { configPath: 'assets/app-config.json' },
      Tree.empty(),
    );

    const content = tree.readText('/src/app/app-initializer.ts');
    expect(content).toContain('assets/app-config.json');
  });

  it('app-initializer.ts uses a custom configPath', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'dynamic-app-config',
      { configPath: 'assets/custom-config.json' },
      Tree.empty(),
    );

    const content = tree.readText('/src/app/app-initializer.ts');
    expect(content).toContain('assets/custom-config.json');
  });

  it('app-initializer.ts exports appInitializer function', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    const content = tree.readText('/src/app/app-initializer.ts');
    expect(content).toContain('export function appInitializer');
  });

  it('app-initializer.ts returns a Promise-returning function', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    const content = tree.readText('/src/app/app-initializer.ts');
    expect(content).toContain('Promise<void>');
  });

  it('modifies app.module.ts to add HttpClientModule import', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const initialTree = Tree.empty();
    initialTree.create('/src/app/app.module.ts', minimalAppModule);

    const tree = await runner.runSchematic('dynamic-app-config', {}, initialTree);

    const content = tree.readText('/src/app/app.module.ts');
    expect(content).toContain("from '@angular/common/http'");
  });

  it('modifies app.module.ts to add HttpClientModule to imports array', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const initialTree = Tree.empty();
    initialTree.create('/src/app/app.module.ts', minimalAppModule);

    const tree = await runner.runSchematic('dynamic-app-config', {}, initialTree);

    const content = tree.readText('/src/app/app.module.ts');
    expect(content).toContain('HttpClientModule');
  });

  it('modifies app.module.ts to add APP_INITIALIZER provider', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const initialTree = Tree.empty();
    initialTree.create('/src/app/app.module.ts', minimalAppModule);

    const tree = await runner.runSchematic('dynamic-app-config', {}, initialTree);

    const content = tree.readText('/src/app/app.module.ts');
    expect(content).toContain('APP_INITIALIZER');
    expect(content).toContain('appInitializer');
    expect(content).toContain('multi: true');
  });

  it('modifies app.module.ts to set useFactory to appInitializer', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const initialTree = Tree.empty();
    initialTree.create('/src/app/app.module.ts', minimalAppModule);

    const tree = await runner.runSchematic('dynamic-app-config', {}, initialTree);

    const content = tree.readText('/src/app/app.module.ts');
    expect(content).toContain('useFactory: appInitializer');
  });

  it('modifies app.module.ts to include HttpClient and AppConfigService in deps', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const initialTree = Tree.empty();
    initialTree.create('/src/app/app.module.ts', minimalAppModule);

    const tree = await runner.runSchematic('dynamic-app-config', {}, initialTree);

    const content = tree.readText('/src/app/app.module.ts');
    expect(content).toContain('HttpClient');
    expect(content).toContain('AppConfigService');
  });

  it('is idempotent for app.module.ts when appInitializer already referenced', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const alreadyModified = minimalAppModule + '\n// already references appInitializer\n';
    const initialTree = Tree.empty();
    initialTree.create('/src/app/app.module.ts', alreadyModified);

    const tree = await runner.runSchematic('dynamic-app-config', {}, initialTree);

    const content = tree.readText('/src/app/app.module.ts');
    const count = (content.match(/appInitializer/g) ?? []).length;
    expect(count).toBe(1);
  });

  it('appends comment to environment.ts', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const initialTree = Tree.empty();
    initialTree.create(
      '/src/environments/environment.ts',
      'export const environment = { production: false };\n',
    );

    const tree = await runner.runSchematic('dynamic-app-config', {}, initialTree);

    const content = tree.readText('/src/environments/environment.ts');
    expect(content).toContain('Dynamic config is loaded at runtime via AppConfigService');
  });

  it('does not duplicate comment in environment.ts on re-run', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const comment =
      '// Dynamic config is loaded at runtime via AppConfigService. Avoid hardcoding API URLs here.';
    const initialTree = Tree.empty();
    initialTree.create(
      '/src/environments/environment.ts',
      `export const environment = {};\n${comment}\n`,
    );

    const tree = await runner.runSchematic('dynamic-app-config', {}, initialTree);

    const content = tree.readText('/src/environments/environment.ts');
    const count = (content.match(/Dynamic config is loaded/g) ?? []).length;
    expect(count).toBe(1);
  });

  it('skips generating a file that already exists', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const initialTree = Tree.empty();
    initialTree.create('/src/assets/app-config.json', '{"apiUrl":"existing"}');

    const tree = await runner.runSchematic('dynamic-app-config', {}, initialTree);

    const content = tree.readText('/src/assets/app-config.json');
    expect(content).toBe('{"apiUrl":"existing"}');
  });

  it('does not create app.module.ts if it does not exist', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expect(tree.files).not.toContain('/src/app/app.module.ts');
  });

  it('does not modify environment.ts if it does not exist', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('dynamic-app-config', {}, Tree.empty());

    expect(tree.files).not.toContain('/src/environments/environment.ts');
  });
});
