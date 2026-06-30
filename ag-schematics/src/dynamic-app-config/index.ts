import * as ts from 'typescript';
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

interface DynamicAppConfigOptions {
  configPath: string;
}

interface InsertChange {
  pos: number;
  text: string;
}

function getSourceFile(content: string, filePath: string): ts.SourceFile {
  return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
}

function findLastImportEnd(source: ts.SourceFile): number {
  let lastEnd = 0;
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) {
      lastEnd = statement.getEnd();
    }
  }
  return lastEnd;
}

function findNgModuleObjectLiteral(source: ts.SourceFile): ts.ObjectLiteralExpression | undefined {
  for (const statement of source.statements) {
    if (!ts.isClassDeclaration(statement)) continue;
    const decorators = ts.getDecorators(statement);
    if (!decorators) continue;
    for (const decorator of decorators) {
      if (
        ts.isCallExpression(decorator.expression) &&
        ts.isIdentifier(decorator.expression.expression) &&
        decorator.expression.expression.text === 'NgModule' &&
        decorator.expression.arguments.length > 0 &&
        ts.isObjectLiteralExpression(decorator.expression.arguments[0])
      ) {
        return decorator.expression.arguments[0] as ts.ObjectLiteralExpression;
      }
    }
  }
  return undefined;
}

function getArrayLiteral(
  obj: ts.ObjectLiteralExpression,
  name: string,
): ts.ArrayLiteralExpression | undefined {
  for (const prop of obj.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === name &&
      ts.isArrayLiteralExpression(prop.initializer)
    ) {
      return prop.initializer;
    }
  }
  return undefined;
}

function insertIntoArray(arr: ts.ArrayLiteralExpression, text: string): InsertChange {
  if (arr.elements.length === 0) {
    return { pos: arr.getEnd() - 1, text };
  }
  const last = arr.elements[arr.elements.length - 1];
  return { pos: last.getEnd(), text: `,\n    ${text}` };
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
    if (!ngModuleArgs) {
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
