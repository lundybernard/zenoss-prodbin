# Zenoss Prodbin - Project Overview

## Project Identity
- **Name**: zenoss-prodbin (Zenoss Platform)
- **Version**: 7.3.0
- **Language**: Python 2.7 (legacy, with future imports)
- **License**: Commercial (Zenoss, Inc.)
- **Build System**: setuptools with wheel packaging via Docker

## Purpose
Zenoss prodbin is the core repository for the Zenoss monitoring platform. It contains:
- The User Interface (ZenUI3)
- Core monitoring daemon infrastructure
- Data collection framework
- Event processing system
- Model catalog and ZODB integration
- API layer (Zuul facades/routers)
- Background job processing (ZenJobs/Celery)

## Package Structure
```
src/
├── Products/           # Zope Products namespace
│   ├── ZenModel/       # Core domain models (Device, DeviceClass, etc.)
│   ├── Zuul/           # API layer (facades, routers, infos)
│   ├── ZenHub/         # Central hub for collector communication
│   ├── ZenEvents/      # Event processing subsystem
│   ├── ZenCollector/   # Data collection framework
│   ├── ZenUtils/       # Shared utilities
│   ├── ZenRRD/         # RRD/metrics integration
│   ├── Jobber/         # Celery-based job processing
│   ├── ZenMessaging/   # Audit and messaging
│   ├── ZenRelations/   # ZODB relationship framework
│   ├── Zing/           # Cloud-native fact publishing
│   └── ...
└── zenoss/
    ├── app/            # Application framework
    └── patches/        # External library patches
```

## Build Commands
```bash
make build     # Build wheel distribution via Docker
make clean     # Remove build artifacts
make test      # Run tests via CI infrastructure
```

## Development Mode
```bash
pip install -e .    # Install in editable mode from devshell
```

## Key Dependencies
- Zope 2 / Zope Component Architecture (ZCA)
- Twisted (async networking)
- Celery (background jobs)
- ZODB (object database)
- Solr (model catalog indexing)
- RabbitMQ (message queuing)
- Redis (caching)
- MariaDB (event storage)
