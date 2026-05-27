---
id_prefix: DOCK
domain: docker-runtime
priority: high
scope: infra
applies_to:
  - backend
  - frontend
  - fullstack
keywords:
  - docker-runtime
  - dock
  - docker
  - runtime
---

# Docker Runtime Strategy (Dynamic Generation Required)

Use this rule when Docker is enabled in project context.

## DOCK-001: Latest Official Docker Guidance First

1. Before generating or changing Dockerfiles, Compose files, or container runbooks, verify the latest official Docker documentation first.
2. Use official Docker sources such as [Docker Compose Quickstart](https://docs.docker.com/compose/gettingstarted/), [Compose file reference](https://docs.docker.com/reference/compose-file/), and [Dockerfile best practices](https://docs.docker.com/build/building/best-practices/).
3. Use current `docker compose` workflows and `compose.yaml`. Do not default to legacy `docker-compose` commands or stale file naming unless backward compatibility is a stated project requirement.
4. Do not add the top-level Compose `version` field by default. The current Compose reference treats it as obsolete. Use it only when a compatibility requirement is explicit and documented.
5. Use the latest stable compatible Docker base image, package-manager flow, and Compose syntax first. If the latest compatible path fails, step down intentionally and document the exact reason for the fallback.

## DOCK-002: Dynamic Generation Only

1. Do not copy generic Docker templates blindly.
2. Generate Docker assets based on actual stack, package manager, and runtime dependencies in the repository.
3. Re-evaluate Docker instructions when dependencies, build tools, or runtime assumptions change.
4. Use the latest stable compatible dependency line first. If an older dependency or base image must be pinned, explain the runtime or compatibility constraint that forced it.

## DOCK-003: Separate Development and Production Lanes

1. Development lane and production lane are separate concerns.
2. Development lane priorities: fast rebuild, hot reload support, debugger-friendly startup, local volume strategy.
3. Production lane priorities: minimal image size, reproducible build, non-root runtime, strict startup command.

## DOCK-004: Selection Means Asset Materialization

1. If Docker is selected for development, create or refine `.dockerignore`, development Dockerfile stage(s), `compose.yaml`, and a runbook before claiming the setup is complete.
2. If Docker is selected for production, create or refine production Dockerfile stage(s), `compose.prod.yaml` or a documented production Compose override, health checks or startup checks, exposed ports, and a deployment runbook before claiming the setup is complete.
3. If Docker is selected for both lanes, keep development and production assets separate enough that hot reload, bind mounts, debug tooling, and production runtime hardening cannot blur into one unsafe path.
4. If the user asks to author files without commands, write the assets and documented commands, but do not execute Docker build, Compose, or registry commands.

## DOCK-005: Security and Supply Chain

1. Use minimal trusted base images with explicit versions.
2. Use multi-stage builds for production images when possible.
3. Avoid baking secrets into image layers.
4. Keep runtime image free from build-only tooling.
5. Use fresh base-image validation with `docker build --pull` and use `--no-cache` when a clean dependency refresh is required.
6. Keep a `.dockerignore` strategy in mind so build contexts stay small and do not leak unnecessary files into the image.

## DOCK-006: Operational Clarity

1. Docker instructions must document expected entrypoint and exposed ports.
2. Local development command and production deployment command must be explicit.
3. If Docker is not selected for the project, do not force containerization tasks.
4. If Compose is used, document which file is the primary entrypoint, which services are dev-only versus production-facing, and why the chosen layout matches the current Docker docs rather than a legacy blog pattern.

## DOCK-007: Review Requirements

1. Verify the generated Docker workflow matches selected runtime environment (Linux/WSL, Windows, macOS).
2. Verify development and production instructions are not mixed into one unsafe image path.
3. Ensure API and service health checks are compatible with container startup behavior.
4. When Docker choices depend on official docs or release behavior, cite the Docker source and verification date in the generated docs or explanation so the next update can refresh them safely.
