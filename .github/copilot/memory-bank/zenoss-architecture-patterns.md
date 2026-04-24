# Zenoss Prodbin - Architecture Patterns

## Zope Component Architecture (ZCA)
Zenoss heavily uses Zope's component architecture for:
- **Interfaces**: Define contracts in `interfaces.py` files
- **Adapters**: Registered via `configure.zcml`
- **Utilities**: Global services registered with `<utility>` ZCML
- **Subscribers**: Event handlers for domain events

### Configuration Files
- `configure.zcml` - Component registration
- `meta.zcml` - Custom ZCML directives
- `permissions.zcml` - Security permissions

## API Architecture (Zuul Layer)

### Pattern: Facade → Router → Info
```
Browser/Client
     ↓
Router (DirectRouter) - JSON/ExtDirect endpoint
     ↓
Facade (IFacade) - Business logic layer
     ↓
Info (IInfo) - View model adapter
     ↓
ZenModel Object - ZODB domain model
```

### Routers (`Products.Zuul.routers/`)
- Inherit from `DirectRouter` (ExtDirect protocol)
- Handle HTTP requests, return `DirectResponse`
- Use `@contextRequire` decorator for permissions
- Call facades for business logic

### Facades (`Products.Zuul.facades/`)
- Implement `IFacade` interface
- Access ZODB via `self._dmd`
- Return Info objects via `IInfo(obj)`
- Handle UIDs (paths like `/zport/dmd/Devices`)

### Infos (`Products.Zuul.infos/`)
- Adapters that implement `IInfo`
- Provide serializable view of domain objects
- Used by marshalling system

## Daemon Architecture

### Hierarchy
```
CmdBase
  └── ZenDaemon
        └── ZCmdBase
              └── PBDaemon (Twisted PB client to ZenHub)
                    └── RRDDaemon (metrics collection)
                          └── CollectorDaemon
```

### Key Patterns
- Daemons connect to ZenHub via Twisted Perspective Broker
- Use `twisted.internet.reactor` for async operations
- Implement `ICollector` interface for collection daemons
- Register services with `provideUtility()`

## ZenHub Services (`Products.ZenHub.services/`)
- Central hub for collector-to-model communication
- Inherit from `HubService`
- Provide remote methods via `pb.Referenceable`
- Examples: `PerformanceConfig`, `EventService`, `ModelerService`

## Domain Model Patterns

### Relationship Schema
```python
from Products.ZenRelations.RelSchema import ToManyCont, ToMany, ToOne

_relations = (
    ("devices", ToManyCont(ToOne, "Products.ZenModel.Device", "deviceClass")),
    ("groups", ToMany(ToMany, "Products.ZenModel.DeviceGroup", "devices")),
)
```

### Managed Entities
- Devices and components inherit from `ManagedEntity`
- Support organizers: DeviceClass, Location, System, Group
- Use zProperties for configuration inheritance

## Event Processing Pipeline
```
Raw Event → zeneventd → EventPipeline → ZEP (Event Processor)
```

Pipeline stages:
1. `CheckInputPipe` - Validate event
2. `IdentifierPipe` - Identify device/component
3. `AddDeviceContextAndTagsPipe` - Enrich with context
4. `TransformPipe` - Apply event transforms
5. `FingerprintPipe` - Dedupe events
6. `SerializeContextPipe` - Prepare for ZEP

## Model Catalog (Solr)
- Indexes ZODB objects for fast search
- `IModelCatalogTool` interface for queries
- `IndexingEvent` triggers reindexing
- Uses `DeviceIndexable` and similar for index specs
