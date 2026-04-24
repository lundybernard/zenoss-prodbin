# Zenoss Prodbin - Key Components

## Products.ZenModel (Domain Models)
Core ZODB-persisted objects:

### Device Hierarchy
```
ManagedEntity
  └── Device              # Physical/virtual device
        ├── DeviceHW      # Hardware container
        └── OperatingSystem  # OS container
              └── components (IpInterface, FileSystem, etc.)
```

### Organizers
- `DeviceClass` - Device type classification
- `Location` - Physical locations
- `System` - Business systems
- `DeviceGroup` - Arbitrary groupings
- `ComponentGroup` - Component groupings

### Templates
- `RRDTemplate` - Collection templates
- `RRDDataSource` - Data collection definition
- `RRDDataPoint` - Individual metrics
- `RRDThreshold` - Alert thresholds

## Products.ZenHub (Central Hub)
Communication nexus for collectors:

### Core Classes
- `ZenHub` - Main hub daemon
- `HubService` - Base service class
- `PBDaemon` - Collector base class

### Key Services
- `EventService` - Event submission
- `PerformanceConfig` - SNMP config
- `ModelerService` - Device modeling
- `DiscoverService` - Device discovery

## Products.ZenCollector (Collection Framework)
Pluggable collection infrastructure:

### Framework Classes
- `CollectorDaemon` - Base collector
- `ConfigurationLoaderTask` - Config refresh
- `ICollectorPreferences` - Config interface
- `ITaskSplitter` - Work distribution

### Config Cache
- `configcache/` - Redis-based config caching
- `configcache/api.py` - Config access API
- Reduces ZenHub load for config retrieval

## Products.ZenEvents (Event System)
Event processing and storage:

### Event Flow
```
Event Source → zeneventd → ZEP → MySQL/Redis
```

### Key Components
- `zeneventd.py` - Event daemon
- `EventPipelineProcessor` - Processing stages
- `EventClass` - Event classification
- `EventClassInst` - Instance transforms

## Products.Jobber (Background Jobs)
Celery-based job processing:

### Key Classes
- `JobRecord` - Job state tracking
- `FacadeMethodJob` - Async facade calls
- `ZenJobs` - Celery app wrapper

### Job Patterns
```python
from Products.Jobber.jobs import FacadeMethodJob

job = FacadeMethodJob.submit(
    dmd, facade_name, method_name, *args, **kwargs
)
```

## Products.Zuul (API Layer)

### Catalog
- `model_catalog.py` - Solr integration
- `IModelCatalogTool` - Query interface
- `IndexingEvent` - Trigger reindex

### Facades (Key Examples)
- `DeviceFacade` - Device operations
- `EventClassesFacade` - Event classes
- `TemplateFacade` - Templates
- `ZepFacade` - Event processor

### Routers (Key Examples)
- `DeviceRouter` - `/device_router`
- `EventsRouter` - `/evconsole_router`
- `TemplateRouter` - `/template_router`

## Products.Zing (Cloud Integration)
Fact publishing for cloud services:

### Fact Types
- Device facts
- Organizer facts
- Component group facts
- Impact relationship facts

### Key Classes
- `Fact` - Fact container
- `IImpactRelationshipsFactProvider` - Impact provider
