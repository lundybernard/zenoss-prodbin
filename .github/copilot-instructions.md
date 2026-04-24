# Zenoss Prodbin - Copilot Instructions

This repository contains the Zenoss monitoring platform core (prodbin).

## Project Context

- **Language**: Python 2.7 with `from __future__ import` compatibility
- **Framework**: Zope 2 with Zope Component Architecture (ZCA)
- **Async**: Twisted for networking and collection daemons
- **Database**: ZODB for model persistence, MariaDB for events
- **Jobs**: Celery for background processing

## Code Style

### Required Header
```python
##############################################################################
#
# Copyright (C) Zenoss, Inc. 2007, all rights reserved.
#
# This content is made available according to terms specified in
# License.zenoss under the directory where your Zenoss product is installed.
#
##############################################################################
```

### Imports Order
1. Standard library
2. Third-party (Zope, Twisted)
3. Products.* (Zenoss packages)
4. Relative imports

### Logging
Use `zen.` prefix: `log = logging.getLogger("zen.mymodule")`

## Architecture Patterns

### API Layer (Zuul)
- **Routers** (`Products.Zuul.routers/`): HTTP endpoints, use `@contextRequire`
- **Facades** (`Products.Zuul.facades/`): Business logic, use `@require`
- **Infos** (`Products.Zuul.infos/`): View model adapters

### Daemons
- Inherit from `CollectorDaemon` for collectors
- Inherit from `PBDaemon` for ZenHub-connected daemons
- Use Twisted `reactor` for async operations

### Relationships
```python
from Products.ZenRelations.RelSchema import ToManyCont, ToMany, ToOne
```

## Key Locations

- Domain models: `src/Products/ZenModel/`
- API facades: `src/Products/Zuul/facades/`
- API routers: `src/Products/Zuul/routers/`
- Hub services: `src/Products/ZenHub/services/`
- Migrations: `src/Products/ZenModel/migrate/`
- Tests: `src/Products/*/tests/`

## Common Operations

### Creating a Migration
```python
from Products.ZenModel.migrate.Migrate import Step, Version

class MyMigration(Step):
    version = Version(7, 3, 1)
    
    def cutover(self, dmd):
        pass

MyMigration()
```

### Testing
```python
from Products.ZenModel.tests.ZenModelBaseTest import ZenModelBaseTest

class TestFeature(ZenModelBaseTest):
    def test_something(self):
        self.dmd  # Access DataRoot
```

## Reference Documentation

See `.github/copilot/memory-bank/` for detailed documentation on:
- Architecture patterns
- Coding conventions
- Key components
- Testing patterns
- Migration system
- **Migration flow and troubleshooting** (`zenoss-migration-flow.md`)
- Daemons and entry points

This memory bank is designed for cross-project use by ZenPacks and other dependent repositories.
