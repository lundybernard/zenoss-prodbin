# Zenoss Prodbin - Quick Reference

## Common Tasks

### Add New Facade Method
1. Define interface in `Products.Zuul.interfaces/<module>.py`
2. Implement in `Products.Zuul.facades/<module>facade.py`
3. Add router method in `Products.Zuul.routers/<module>.py`
4. Register in `Products.Zuul.facades/configure.zcml`

### Add New zProperty
```python
# In migration file:
def cutover(self, dmd):
    dmd.Devices.addZProperty("zMyProp", "default", type="string")
```

### Add Device Component
1. Create model class in `Products.ZenModel/`
2. Define relationships in `_relations`
3. Add to container's `_relations`
4. Create Info adapter
5. Register with ZCML

### Create Migration
```python
# Products.ZenModel.migrate/myMigration.py
from Products.ZenModel.migrate.Migrate import Step, Version

class MyMigration(Step):
    version = Version(7, 3, 1)
    
    def cutover(self, dmd):
        # Implementation
        pass

MyMigration()  # Self-register
```

## Key Imports

```python
# ZODB/Model
from Products.ZenModel.Device import Device
from Products.ZenRelations.RelSchema import ToManyCont, ToMany, ToOne

# API Layer
from Products.Zuul import getFacade
from Products.Zuul.interfaces import IInfo, IFacade
from Products.Zuul.decorators import require, contextRequire

# Events
from Products.Zuul.catalog.events import IndexingEvent
from zope.event import notify

# ZCA
from zope.interface import implementer
from zope.component import getUtility, provideUtility

# Twisted
from twisted.internet import defer, reactor

# Transactions
import transaction
```

## File Locations

| Purpose | Location |
|---------|----------|
| Domain Models | `src/Products/ZenModel/` |
| Facades | `src/Products/Zuul/facades/` |
| Routers | `src/Products/Zuul/routers/` |
| Interfaces | `src/Products/Zuul/interfaces/` |
| Info Adapters | `src/Products/Zuul/infos/` |
| ZenHub Services | `src/Products/ZenHub/services/` |
| Migrations | `src/Products/ZenModel/migrate/` |
| Tests | `src/Products/*/tests/` |
| Daemons (bin) | `bin/` |
| BDD Tests | `bdd/` |

## Debugging

### Interactive Shell
```bash
zendmd              # Zenoss shell with dmd access
```

### Common dmd Operations
```python
# In zendmd:
dmd.Devices.getSubDevices()     # All devices
dmd.Devices.Server              # DeviceClass
device = find("mydevice")       # Find device
device.os.interfaces()          # Device interfaces
commit()                        # Save changes
```

### Logging
```python
import logging
log = logging.getLogger("zen.mymodule")
log.setLevel(logging.DEBUG)
```

## Testing

### Run Specific Test
```bash
bin/runtests.py -m Products.ZenModel.tests.testDevice
```

### Test Base Classes
```python
from Products.ZenTestCase.BaseTestCase import BaseTestCase
from Products.ZenModel.tests.ZenModelBaseTest import ZenModelBaseTest
```

## External Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| ZenHub | Collector hub | Port 8789 |
| Solr | Model catalog | Via model_catalog |
| Redis | Caching | RedisUtils |
| RabbitMQ | Messaging | zenoss.protocols |
| MariaDB | Events | ZenEventManager |
| Celery | Jobs | Products.Jobber |
