# Zenoss Prodbin - Memory Bank

This directory contains documentation about the zenoss-prodbin codebase for use by GitHub Copilot and development reference. This memory bank is designed to be shared across dependent projects (ZenPacks, service definitions, etc.).

## Contents

| File | Description |
|------|-------------|
| [zenoss-prodbin-overview.md](zenoss-prodbin-overview.md) | Project identity, structure, build commands, dependencies |
| [zenoss-architecture-patterns.md](zenoss-architecture-patterns.md) | ZCA, Facade→Router→Info pattern, daemon hierarchy, event pipeline |
| [zenoss-coding-conventions.md](zenoss-coding-conventions.md) | File headers, imports, logging, security decorators, naming |
| [zenoss-key-components.md](zenoss-key-components.md) | ZenModel, ZenHub, ZenCollector, ZenEvents, Jobber, Zuul, Zing |
| [zenoss-testing-patterns.md](zenoss-testing-patterns.md) | Unit tests, BDD (Behave), Jasmine, CI infrastructure |
| [zenoss-migration-system.md](zenoss-migration-system.md) | Migration framework, Step class, version handling, patterns |
| [zenoss-migration-flow.md](zenoss-migration-flow.md) | **Detailed upgrade/migration flow with troubleshooting** |
| [zenoss-daemons-entrypoints.md](zenoss-daemons-entrypoints.md) | All daemons, entry points, collector creation |
| [zenoss-quick-reference.md](zenoss-quick-reference.md) | Common tasks, imports, file locations, debugging |
| [zenoss-common-gotchas.md](zenoss-common-gotchas.md) | ZODB patterns, relationship gotchas, performance tips |

## Cross-Project Usage

This memory bank can be referenced by agents working on:
- **ZenPacks** - For writing migrations, understanding model relationships
- **product-assembly** - For service configuration and deployment
- **zenoss-protocols** - For event/messaging integration
- **europa** - For UI integration patterns

## Usage

These files are automatically available to GitHub Copilot when working in this repository. The documentation helps Copilot understand:

- Project conventions and patterns
- Where to find specific functionality
- How to write idiomatic Zenoss code
- Common pitfalls to avoid
- **Troubleshooting upgrade/migration issues**

### For Dependent Projects

Other Zenoss projects can reference this memory bank by:

1. **Direct Reference**: Point agents to `zenoss-prodbin/.github/copilot/memory-bank/`
2. **Copy Key Files**: Copy relevant files to your project's memory bank
3. **Link in Instructions**: Reference in your `copilot-instructions.md`:
   ```markdown
   For prodbin patterns, see: https://github.com/zenoss/zenoss-prodbin/.github/copilot/memory-bank/
   ```

### Key Files for ZenPack Development

- `zenoss-migration-flow.md` - How to write and debug migrations
- `zenoss-architecture-patterns.md` - Model relationships, ZCA patterns
- `zenoss-coding-conventions.md` - Code style requirements

## Updating

When making significant changes to the codebase:
1. Update relevant memory bank files
2. Add new patterns or gotchas discovered
3. Keep quick reference up to date
