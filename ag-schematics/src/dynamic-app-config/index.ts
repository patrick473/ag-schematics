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
import {
  InsertChange,
  findLastImportEnd,
  findNgModuleObjectLiteral,
  getArrayLiteral,
  getSourceFile,
  insertIntoArray,
} from '../utils/typescript-ast';

interface DynamicAppConfigOptions {
  configPath: string;
}

function modifyAppModule(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const modulePath = '/src/app/app.module.ts';
    if (!tree.exists(modulePath)) {
      context.logger.warn('app.module.ts not found. Skipping module modification.');
      return;
    }

    const content = tree.readText(modulePath);

    // Idempotency: skip if appInitializer is already referenced
    if (content.includes('appInitializer')) {
      return;
    }

    const source = getSourceFile(content, modulePath);
    const changes: InsertChange[] = [];

    // Add import declarations after the last existing import
    const lastImportEnd = findLastImportEnd(source);
    const newImports = [
      `import { HttpClientModule, HttpClient } from '@angular/common/http';`,
      `import { APP_INITIALIZER } from '@angular/core';`,
      `import { appInitializer } from './app-initializer';`,
      `import { AppConfigService } from './core/app-config.service';`,
    ].join('\n');
    changes.push({ pos: lastImportEnd, text: `\n${newImports}` });

    // Modify NgModule decorator
    const ngModuleArgs = findNgModuleObjectLiteral(source);
    if (ngModuleArgs === undefined) {
      context.logger.warn(
        'NgModule decorator not found in app.module.ts. Skipping decorator modification.',
      );
    } else {
      // Add HttpClientModule to imports array if not already present
      if (!content.includes('HttpClientModule')) {
        const importsArr = getArrayLiteral(ngModuleArgs, 'imports');
        if (importsArr) {
          changes.push(insertIntoArray(importsArr, 'HttpClientModule'));
        }
      }

      // Add APP_INITIALIZER provider to providers array
      const providersArr = getArrayLiteral(ngModuleArgs, 'providers');
      if (providersArr) {
        const providerText = [
          '{',
          '      provide: APP_INITIALIZER,',
          '      useFactory: appInitializer,',
          '      deps: [HttpClient, AppConfigService],',
          '      multi: true,',
          '    }',
        ].join('\n');
        changes.push(insertIntoArray(providersArr, providerText));
      }
    }

    // Apply changes in reverse position order to preserve offsets
    changes.sort((a, b) => b.pos - a.pos);
    const recorder = tree.beginUpdate(modulePath);
    for (const change of changes) {
      recorder.insertLeft(change.pos, change.text);
    }
    tree.commitUpdate(recorder);
  };
}

function appendEnvironmentComment(): Rule {
  return (tree: Tree) => {
    const envPath = '/src/environments/environment.ts';
    if (!tree.exists(envPath)) return;

    const content = tree.readText(envPath);
    const comment =
      '// Dynamic config is loaded at runtime via AppConfigService. Avoid hardcoding API URLs here.';
    if (content.includes(comment)) return;

    const recorder = tree.beginUpdate(envPath);
    recorder.insertLeft(content.length, `\n${comment}\n`);
    tree.commitUpdate(recorder);
  };
}

export function dynamicAppConfig(options: DynamicAppConfigOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      applyTemplates({ ...options }),
      filter((path) => !tree.exists(path)),
      move(''),
    ]);
    return chain([
      mergeWith(sourceParametrizedTemplates),
      modifyAppModule(),
      appendEnvironmentComment(),
    ])(tree, context);
  };
}
