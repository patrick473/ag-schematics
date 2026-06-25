import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('sonar-config', () => {
  it('creates the sonar-project.properties file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'sonar-config',
      { projectKey: 'my-project', projectName: 'my-service' },
      Tree.empty()
    );

    expect(tree.files).toContain('/sonar-project.properties');
  });

  it('inserts the dasherized projectKey and projectName into the properties file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'sonar-config',
      { projectKey: 'MyProject', projectName: 'MyService' },
      Tree.empty()
    );

    const content = tree.readText('/sonar-project.properties');
    expect(content).toContain('sonar.projectKey=my-project');
    expect(content).toContain('sonar.projectName=my-service');
  });

  it('uses default values when none are provided', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'sonar-config',
      {},
      Tree.empty()
    );

    const content = tree.readText('/sonar-project.properties');
    expect(content).toContain('sonar.projectKey=f-service');
    expect(content).toContain('sonar.projectName=frontend-service');
  });

  it('includes the expected static sonar properties', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic(
      'sonar-config',
      { projectKey: 'f-service', projectName: 'frontend-service', organization: 'organization' },
      Tree.empty()
    );

    const content = tree.readText('/sonar-project.properties');
    expect(content).toContain('sonar.sources=./src');
    expect(content).toContain('sonar.organization=organization');
  });
});
