# Schematic Spec: k8s-config

## Overview
- **Name:** k8s-config
- **Factory:** k8sConfig
- **Type:** config
- **Folder:** src/k8s-config/
- **Description:** Adds Kubernetes Deployment, Service, and Ingress manifests to the project

## Schema Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| applicationName | string | "frontend-service" | Used in resource names, labels, and image reference |
| namespace | string | "default" | Kubernetes namespace for all resources |
| port | number | 80 | Container port exposed by the Deployment and targeted by the Service |
| replicas | number | 2 | Desired replica count in the Deployment |
| ingressHost | string | "app.example.com" | Hostname for the Ingress rule |

## Template Files
- `k8s/deployment.yaml` — Kubernetes Deployment with applicationName, namespace, replicas, and port interpolated
- `k8s/service.yaml` — ClusterIP Service targeting the Deployment pods on the configured port
- `k8s/ingress.yaml` — Ingress resource routing ingressHost to the Service

## Dependencies
None

## npm Scripts
| Name | Command |
|------|---------|
| k8s:apply | kubectl apply -f k8s/ |

## JSON Modifications
None

## Idempotency Notes
- Skip generating each file (`k8s/deployment.yaml`, `k8s/service.yaml`, `k8s/ingress.yaml`) individually if it already exists in the tree

## Open Questions
None.
