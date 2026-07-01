import * as ts from 'typescript';

export interface InsertChange {
  pos: number;
  text: string;
}

export function getSourceFile(content: string, filePath: string): ts.SourceFile {
  return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
}

export function findLastImportEnd(source: ts.SourceFile): number {
  let lastEnd = 0;
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) {
      lastEnd = statement.getEnd();
    }
  }
  return lastEnd;
}

export function findNgModuleObjectLiteral(
  source: ts.SourceFile,
): ts.ObjectLiteralExpression | undefined {
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
        return decorator.expression.arguments[0];
      }
    }
  }
  return undefined;
}

export function getArrayLiteral(
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

export function insertIntoArray(arr: ts.ArrayLiteralExpression, text: string): InsertChange {
  if (arr.elements.length === 0) {
    return { pos: arr.getEnd() - 1, text };
  }
  const last = arr.elements.at(-1);
  if (!last) {
    throw new Error('Unexpected error: last element of array is undefined');
  }
  return { pos: last.getEnd(), text: `,\n    ${text}` };
}
