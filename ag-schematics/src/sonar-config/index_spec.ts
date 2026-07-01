import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import { expectFileContains, expectFileExists } from '../utils/test/tree-helpers';

const collectionPath = path.join(__dirname, '../collection.json');

describe('sonar-config', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);
  it('creates the sonar-project.properties file', async () => {
    const tree = await runner.runSchematic(
      'sonar-config',
      { projectKey: 'my-project', projectName: 'my-service' },
      Tree.empty(),
    );

    expectFileExists(tree, '/sonar-project.properties');
  });

  it('inserts the dasherized projectKey and projectName into the properties file', async () => {
    const tree = await runner.runSchematic(
      'sonar-config',
      { projectKey: 'MyProject', projectName: 'MyService' },
      Tree.empty(),
    );

    expectFileContains(
      tree,
      '/sonar-project.properties',
      'sonar.projectKey=my-project',
      'sonar.projectName=my-service',
    );
  });

  it('uses default values when none are provided', async () => {
    const tree = await runner.runSchematic('sonar-config', {}, Tree.empty());

    expectFileContains(
      tree,
      '/sonar-project.properties',
      'sonar.projectKey=f-service',
      'sonar.projectName=frontend-service',
    );
  });

  it('includes the expected static sonar properties', async () => {
    const tree = await runner.runSchematic(
      'sonar-config',
      { projectKey: 'f-service', projectName: 'frontend-service', organization: 'organization' },
      Tree.empty(),
    );

    expectFileContains(
      tree,
      '/sonar-project.properties',
      'sonar.sources=./src',
      'sonar.organization=organization',
    );
  });
});
