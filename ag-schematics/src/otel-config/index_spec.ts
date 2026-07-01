import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

const EXISTING_NGINX_CONF = `server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        set $backend http://\${BACKEND_HOST}/api/;
        proxy_pass $backend;
    }

    # Angular SPA: fall back to index.html for any unknown path
    location / {
        try_files $uri $uri/ /index.html;
    }
}
`;

const NGINX_CONF_WITH_OTLP = `server {
    listen 80;

    location /otlp/ {
        set $otel http://\${OTEL_COLLECTOR_HOST};
        proxy_pass $otel;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
`;

describe('otel-config', () => {
  it('creates otel-config.yaml', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('otel-config', {}, Tree.empty());

    expect(tree.files).toContain('/otel-config.yaml');
  });

  it('creates nginx.conf when it does not exist', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('otel-config', {}, Tree.empty());

    expect(tree.files).toContain('/nginx.conf.template');
  });

  it('includes the /otlp/ location block in a newly created nginx.conf', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('otel-config', {}, Tree.empty());

    const content = tree.readText('/nginx.conf.template');
    expect(content).toContain('location /otlp/');
    expect(content).toContain('${OTEL_COLLECTOR_HOST}');
  });

  it('adds the /otlp/ location block to an existing nginx.conf', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const initialTree = Tree.empty();
    initialTree.create('/nginx.conf', EXISTING_NGINX_CONF);

    const tree = await runner.runSchematic('otel-config', {}, initialTree);

    const content = tree.readText('/nginx.conf.template');
    expect(content).toContain('location /otlp/');
    expect(content).toContain('${OTEL_COLLECTOR_HOST}');
  });

  it('inserts the /otlp/ block before the SPA fallback location', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const initialTree = Tree.empty();
    initialTree.create('/nginx.conf', EXISTING_NGINX_CONF);

    const tree = await runner.runSchematic('otel-config', {}, initialTree);

    const content = tree.readText('/nginx.conf.template');
    const otlpIndex = content.indexOf('location /otlp/');
    const spaIndex = content.indexOf('location / {');
    expect(otlpIndex).toBeLessThan(spaIndex);
  });

  it('does not duplicate the /otlp/ block if already present', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const initialTree = Tree.empty();
    initialTree.create('/nginx.conf', NGINX_CONF_WITH_OTLP);

    const tree = await runner.runSchematic('otel-config', {}, initialTree);

    const content = tree.readText('/nginx.conf.template');
    const firstIndex = content.indexOf('location /otlp/');
    const secondIndex = content.indexOf('location /otlp/', firstIndex + 1);
    expect(secondIndex).toBe(-1);
  });

  it('inserts the /otlp/ block before the root location when there is no SPA comment marker', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const initialTree = Tree.empty();
    initialTree.create(
      '/nginx.conf',
      `server {\n    listen 80;\n\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n}\n`,
    );

    const tree = await runner.runSchematic('otel-config', {}, initialTree);

    const content = tree.readText('/nginx.conf.template');
    const otlpIndex = content.indexOf('location /otlp/');
    const rootIndex = content.indexOf('location / {');
    expect(otlpIndex).toBeGreaterThanOrEqual(0);
    expect(otlpIndex).toBeLessThan(rootIndex);
  });

  it('warns and leaves nginx.conf unchanged when no insertion point is found', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const noMarkerConf = `server {\n    listen 80;\n}\n`;
    const initialTree = Tree.empty();
    initialTree.create('/nginx.conf.template', noMarkerConf);

    const warnings: string[] = [];
    runner.logger.subscribe((entry) => {
      if (entry.level === 'warn') warnings.push(entry.message);
    });

    const tree = await runner.runSchematic('otel-config', {}, initialTree);

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('Could not find insertion point');
    expect(tree.readText('/nginx.conf.template')).toBe(noMarkerConf);
  });
});
