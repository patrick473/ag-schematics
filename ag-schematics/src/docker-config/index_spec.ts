import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import { expectFileContains, expectFileExists } from '../utils/test/tree-helpers';

const collectionPath = path.join(__dirname, '../collection.json');

describe('docker-config', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);
  it('creates a Dockerfile, compose.yaml, and nginx.conf', async () => {
    const tree = await runner.runSchematic(
      'docker-config',
      { applicationName: 'my-app', backendName: 'my-backend', port: 4200 },
      Tree.empty(),
    );

    expectFileExists(tree, '/Dockerfile', '/compose.yaml', '/nginx.conf.template');
  });

  it('uses nginx as the base image in the Dockerfile', async () => {
    const tree = await runner.runSchematic(
      'docker-config',
      { applicationName: 'my-app', backendName: 'my-backend', port: 4200 },
      Tree.empty(),
    );

    expectFileContains(tree, '/Dockerfile', 'FROM nginx:');
  });

  it('copies the built Angular output from the dasherized applicationName dist folder', async () => {
    const tree = await runner.runSchematic(
      'docker-config',
      { applicationName: 'MyFrontendService', backendName: 'my-backend', port: 4200 },
      Tree.empty(),
    );

    expectFileContains(tree, '/Dockerfile', 'dist/my-frontend-service/browser');
  });

  it('sets the configured port in compose.yaml', async () => {
    const tree = await runner.runSchematic(
      'docker-config',
      { applicationName: 'my-app', backendName: 'my-backend', port: 8080 },
      Tree.empty(),
    );

    expectFileContains(tree, '/compose.yaml', '"8080:80"');
  });

  it('uses the dasherized applicationName as the compose service name', async () => {
    const tree = await runner.runSchematic(
      'docker-config',
      { applicationName: 'MyFrontendService', backendName: 'my-backend', port: 4200 },
      Tree.empty(),
    );

    expectFileContains(tree, '/compose.yaml', 'my-frontend-service:');
  });

  it('sets the dasherized backendName as the BACKEND_HOST in the Dockerfile', async () => {
    const tree = await runner.runSchematic(
      'docker-config',
      { applicationName: 'my-app', backendName: 'MyBackendService', port: 4200 },
      Tree.empty(),
    );

    expectFileContains(tree, '/Dockerfile', 'my-backend-service:8080');
  });

  it('uses defaults when no options are provided', async () => {
    const tree = await runner.runSchematic('docker-config', {}, Tree.empty());

    expectFileContains(tree, '/Dockerfile', 'dist/frontend-service/browser');
    expectFileContains(tree, '/compose.yaml', '"4200:80"', 'frontend-service:');
  });
});
