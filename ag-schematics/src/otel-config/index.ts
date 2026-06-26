import { strings } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  applyTemplates,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';

interface OtelConfigOptions {}

const NGINX_CONF_PATH = '/nginx.conf';
const OTLP_LOCATION_MARKER = 'location /otlp/';
const SPA_FALLBACK_MARKER = '    # Angular SPA:';
const LOCATION_ROOT_MARKER = '    location / {';

const OTLP_BLOCK = [
  '    # Proxy browser OTLP exports to the collector to keep telemetry same-origin.',
  '    location /otlp/ {',
  '        set $otel http://${OTEL_COLLECTOR_HOST};',
  '        rewrite ^/otlp/(.*)$ /$1 break;',
  '        proxy_pass $otel;',
  '        proxy_set_header Host $host;',
  '        proxy_set_header X-Forwarded-Proto $scheme;',
  '    }',
  '',
].join('\n');

const DEFAULT_NGINX_CONF = [
  'server {',
  '    listen 80;',
  '    server_name _;',
  '',
  '    root /usr/share/nginx/html;',
  '    index index.html;',
  '',
  '    # Resolver is injected at container start via RESOLVER env var.',
  '    # Docker embedded DNS: 127.0.0.11',
  '    # AKS CoreDNS: typically 10.0.0.10 (check with: kubectl get svc -n kube-system kube-dns)',
  '    resolver ${RESOLVER} valid=30s ipv6=off;',
  '',
  '    # Proxy API calls to the backend service.',
  '    # Using a variable defers DNS lookup to request time, so nginx starts even if the backend is not yet available.',
  '    location /api/ {',
  "        # ponytail: set must come before rewrite; rewrite's `break` flag stops all",
  '        # ngx_http_rewrite_module directives (including set) that follow it.',
  '        set $backend ${BACKEND_HOST};',
  '        rewrite ^/api/(.*)$ /$1 break;',
  '        proxy_pass $backend;',
  '        proxy_set_header Host $host;',
  '        proxy_set_header X-Real-IP $remote_addr;',
  '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
  '        proxy_set_header X-Forwarded-Proto $scheme;',
  '    }',
  '',
  '    # Proxy browser OTLP exports to the collector to keep telemetry same-origin.',
  '    location /otlp/ {',
  '        set $otel http://${OTEL_COLLECTOR_HOST};',
  '        rewrite ^/otlp/(.*)$ /$1 break;',
  '        proxy_pass $otel;',
  '        proxy_set_header Host $host;',
  '        proxy_set_header X-Forwarded-Proto $scheme;',
  '    }',
  '',
  '    # Angular SPA: fall back to index.html for any unknown path',
  '    location / {',
  '        try_files $uri $uri/ /index.html;',
  '    }',
  '',
  '    # Cache static assets aggressively',
  '    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {',
  '        expires 1y;',
  '        add_header Cache-Control "public, immutable";',
  '    }',
  '}',
  '',
].join('\n');

export function otelConfig(options: OtelConfigOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    if (tree.exists(NGINX_CONF_PATH)) {
      const content = tree.readText(NGINX_CONF_PATH);
      if (!content.includes(OTLP_LOCATION_MARKER)) {
        const insertIdx = content.includes(SPA_FALLBACK_MARKER)
          ? content.indexOf(SPA_FALLBACK_MARKER)
          : content.indexOf(LOCATION_ROOT_MARKER);
        if (insertIdx !== -1) {
          const updated =
            content.slice(0, insertIdx) + OTLP_BLOCK + '\n' + content.slice(insertIdx);
          tree.overwrite(NGINX_CONF_PATH, updated);
        } else {
          _context.logger.warn(
            'Could not find insertion point in nginx.conf; OTLP location block was not added.',
          );
        }
      }
    } else {
      tree.create(NGINX_CONF_PATH, DEFAULT_NGINX_CONF);
    }

    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        ...strings,
        ...options,
      }),
      move(''),
    ]);
    return mergeWith(sourceParametrizedTemplates)(tree, _context);
  };
}
