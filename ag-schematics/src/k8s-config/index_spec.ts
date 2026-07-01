import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import {
  expectFileContains,
  expectFileExists,
  expectScript,
  treeWithFile,
} from '../utils/test/tree-helpers';

const collectionPath = path.join(__dirname, '../collection.json');

const defaultOptions = {
  applicationName: 'my-app',
  namespace: 'default',
  port: 80,
  replicas: 2,
  ingressHost: 'app.example.com',
};

describe('k8s-config', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);
  it('creates deployment.yaml, service.yaml, and ingress.yaml', async () => {
    const tree = await runner.runSchematic('k8s-config', defaultOptions, Tree.empty());

    expectFileExists(tree, '/k8s/deployment.yaml', '/k8s/service.yaml', '/k8s/ingress.yaml');
  });

  it('uses the dasherized applicationName in deployment labels and image', async () => {
    const tree = await runner.runSchematic(
      'k8s-config',
      { ...defaultOptions, applicationName: 'MyFrontendService' },
      Tree.empty(),
    );

    expectFileContains(
      tree,
      '/k8s/deployment.yaml',
      'name: my-frontend-service',
      'app: my-frontend-service',
      'image: my-frontend-service:latest',
    );
  });

  it('uses the dasherized applicationName in service.yaml and ingress.yaml', async () => {
    const tree = await runner.runSchematic(
      'k8s-config',
      { ...defaultOptions, applicationName: 'MyFrontendService' },
      Tree.empty(),
    );

    expectFileContains(
      tree,
      '/k8s/service.yaml',
      'name: my-frontend-service',
      'app: my-frontend-service',
    );

    const ingress = tree.readText('/k8s/ingress.yaml');
    // applicationName appears in both metadata.name and backend.service.name
    expect(ingress.match(/name: my-frontend-service/g)?.length).toBe(2);
  });

  it('sets the namespace in all three manifests', async () => {
    const tree = await runner.runSchematic(
      'k8s-config',
      { ...defaultOptions, namespace: 'production' },
      Tree.empty(),
    );

    expectFileContains(tree, '/k8s/deployment.yaml', 'namespace: production');
    expectFileContains(tree, '/k8s/service.yaml', 'namespace: production');
    expectFileContains(tree, '/k8s/ingress.yaml', 'namespace: production');
  });

  it('sets the replica count in deployment.yaml', async () => {
    const tree = await runner.runSchematic(
      'k8s-config',
      { ...defaultOptions, replicas: 5 },
      Tree.empty(),
    );

    expectFileContains(tree, '/k8s/deployment.yaml', 'replicas: 5');
  });

  it('sets the port in deployment.yaml and service.yaml', async () => {
    const tree = await runner.runSchematic(
      'k8s-config',
      { ...defaultOptions, port: 8080 },
      Tree.empty(),
    );

    expectFileContains(tree, '/k8s/deployment.yaml', 'containerPort: 8080');
    expectFileContains(tree, '/k8s/service.yaml', 'port: 8080', 'targetPort: 8080');
  });

  it('sets the ingressHost in ingress.yaml', async () => {
    const tree = await runner.runSchematic(
      'k8s-config',
      { ...defaultOptions, ingressHost: 'my-app.internal.example.com' },
      Tree.empty(),
    );

    expectFileContains(tree, '/k8s/ingress.yaml', 'host: my-app.internal.example.com');
  });

  it('does not overwrite existing manifest files', async () => {
    const tree = await runner.runSchematic(
      'k8s-config',
      defaultOptions,
      treeWithFile('/k8s/deployment.yaml', 'existing content'),
    );

    expect(tree.readText('/k8s/deployment.yaml')).toBe('existing content');
  });

  it('adds the k8s:apply script to package.json', async () => {
    const tree = await runner.runSchematic(
      'k8s-config',
      defaultOptions,
      treeWithFile('package.json', JSON.stringify({ name: 'test-app' })),
    );

    expectScript(tree, 'k8s:apply', 'kubectl apply -f k8s/');
  });

  it('does not overwrite an existing k8s:apply script', async () => {
    const tree = await runner.runSchematic(
      'k8s-config',
      defaultOptions,
      treeWithFile(
        'package.json',
        JSON.stringify({ name: 'test-app', scripts: { 'k8s:apply': 'custom command' } }),
      ),
    );

    expectScript(tree, 'k8s:apply', 'custom command');
  });
});
