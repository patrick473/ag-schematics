import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import { expectScript } from '../utils/test/tree-helpers';

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

    expect(tree.files).toContain('/k8s/deployment.yaml');
    expect(tree.files).toContain('/k8s/service.yaml');
    expect(tree.files).toContain('/k8s/ingress.yaml');
  });

  it('uses the dasherized applicationName in deployment labels and image', async () => {
    const tree = await runner.runSchematic(
      'k8s-config',
      { ...defaultOptions, applicationName: 'MyFrontendService' },
      Tree.empty(),
    );

    const content = tree.readText('/k8s/deployment.yaml');
    expect(content).toContain('name: my-frontend-service');
    expect(content).toContain('app: my-frontend-service');
    expect(content).toContain('image: my-frontend-service:latest');
  });

  it('sets the namespace in all three manifests', async () => {
    const tree = await runner.runSchematic(
      'k8s-config',
      { ...defaultOptions, namespace: 'production' },
      Tree.empty(),
    );

    expect(tree.readText('/k8s/deployment.yaml')).toContain('namespace: production');
    expect(tree.readText('/k8s/service.yaml')).toContain('namespace: production');
    expect(tree.readText('/k8s/ingress.yaml')).toContain('namespace: production');
  });

  it('sets the replica count in deployment.yaml', async () => {
    const tree = await runner.runSchematic(
      'k8s-config',
      { ...defaultOptions, replicas: 5 },
      Tree.empty(),
    );

    expect(tree.readText('/k8s/deployment.yaml')).toContain('replicas: 5');
  });

  it('sets the port in deployment.yaml and service.yaml', async () => {
    const tree = await runner.runSchematic(
      'k8s-config',
      { ...defaultOptions, port: 8080 },
      Tree.empty(),
    );

    expect(tree.readText('/k8s/deployment.yaml')).toContain('containerPort: 8080');
    expect(tree.readText('/k8s/service.yaml')).toContain('port: 8080');
    expect(tree.readText('/k8s/service.yaml')).toContain('targetPort: 8080');
  });

  it('sets the ingressHost in ingress.yaml', async () => {
    const tree = await runner.runSchematic(
      'k8s-config',
      { ...defaultOptions, ingressHost: 'my-app.internal.example.com' },
      Tree.empty(),
    );

    expect(tree.readText('/k8s/ingress.yaml')).toContain('host: my-app.internal.example.com');
  });

  it('does not overwrite existing manifest files', async () => {
    const initialTree = Tree.empty();
    initialTree.create('/k8s/deployment.yaml', 'existing content');

    const tree = await runner.runSchematic('k8s-config', defaultOptions, initialTree);

    expect(tree.readText('/k8s/deployment.yaml')).toBe('existing content');
  });

  it('adds the k8s:apply script to package.json', async () => {
    const initialTree = Tree.empty();
    initialTree.create('package.json', JSON.stringify({ name: 'test-app' }));

    const tree = await runner.runSchematic('k8s-config', defaultOptions, initialTree);

    expectScript(tree, 'k8s:apply', 'kubectl apply -f k8s/');
  });

  it('does not overwrite an existing k8s:apply script', async () => {
    const initialTree = Tree.empty();
    initialTree.create(
      'package.json',
      JSON.stringify({ name: 'test-app', scripts: { 'k8s:apply': 'custom command' } }),
    );

    const tree = await runner.runSchematic('k8s-config', defaultOptions, initialTree);

    expectScript(tree, 'k8s:apply', 'custom command');
  });
});
