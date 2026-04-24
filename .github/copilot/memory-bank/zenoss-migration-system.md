# Zenoss Prodbin - Migration System

## Overview
Data migrations in `Products.ZenModel.migrate/` handle schema and data changes across versions.

## Migration Framework

### Base Class
```python
from Products.ZenModel.migrate.Migrate import Step, Version

class MyMigration(Step):
    version = Version(7, 2, 1)  # Target version
    
    def cutover(self, dmd):
        """Execute the migration."""
        # Migration logic here
        pass
```

### Step Properties
- `version` - Target Zenoss version (Version object)
- `dependencies` - Other steps that must run first
- `cutover(dmd)` - Migration implementation

### Running Migrations
```bash
zenmigrate              # Run pending migrations
zenmigrate --step=Name  # Run specific step
```

## Migration Patterns

### Adding zProperties
```python
def cutover(self, dmd):
    dmd.Devices.addZProperty("zMyNewProp", "default_value")
```

### Updating Indexes
```python
def cutover(self, dmd):
    from Products.Zuul.catalog.events import IndexingEvent
    from zope.event import notify
    
    for device in dmd.Devices.getSubDevices():
        notify(IndexingEvent(device))
```

### Service Definition Changes
Migrate service configurations via:
- `config-files/` subdirectory for templates
- `data/` subdirectory for data files

### Adding Event Classes
```python
def cutover(self, dmd):
    ec = dmd.Events.createOrganizer("/MyEventClass")
    ec.transform = "evt.severity = 3"
```

## Notable Migration Categories

### Device/Model Changes
- Index updates
- New zProperties
- Relationship changes

### Service Configuration
- ZenHub service additions
- Health check updates
- Log filter changes

### UI/Permission Changes
- Menu items
- Role permissions
- Default settings

## Migration File Naming
```
addMyFeature.py         # Adding new features
fixSomeBug.py           # Bug fixes
updateConfiguration.py  # Config updates
removeOldFeature.py     # Cleanup
```

## Version Object
```python
from Products.ZenModel.migrate.Migrate import Version

# Version(major, minor, patch)
v = Version(7, 2, 1)
```

## Ordering
Migrations ordered by:
1. Version number
2. Dependencies
3. File discovery order

## Testing Migrations
```python
class TestMyMigration(ZenModelBaseTest):
    def test_migration(self):
        step = MyMigration()
        step.cutover(self.dmd)
        # Verify results
```
