# Zenoss Prodbin - Common Patterns and Gotchas

## ZODB Patterns

### Transaction Management
```python
import transaction

# Always commit after changes
def make_changes(dmd):
    device = dmd.Devices.createInstance("new-device")
    transaction.commit()  # Required!

# Use savepoints for rollback
savepoint = transaction.savepoint()
try:
    risky_operation()
except Exception:
    savepoint.rollback()
```

### Acquisition
ZODB objects use Zope acquisition for attribute lookup:
```python
from Acquisition import aq_base, aq_parent

# Get unwrapped object
bare_obj = aq_base(obj)

# Get parent
parent = aq_parent(obj)
```

## Relationship Gotchas

### Defining Relationships
```python
_relations = (
    # Container relationship (parent owns children)
    ("components", ToManyCont(ToOne, "...Component", "device")),
    
    # Reference relationship (no ownership)
    ("groups", ToMany(ToMany, "...Group", "devices")),
)
```

### Relationship Errors
- Missing reverse relationship causes errors
- Use `zenchkrels` to verify relationship integrity

## Event Processing

### Event Priority
Events have severity levels:
- 5 (Critical) → 4 (Error) → 3 (Warning) → 2 (Info) → 1 (Debug) → 0 (Clear)

### Transform Context
```python
# In event transform:
evt    # Event being processed
device # Device object (may be None)
dmd    # DataRoot
```

## Common Issues

### 1. Missing Catalog Entry
```python
# Force reindex
from Products.Zuul.catalog.events import IndexingEvent
from zope.event import notify
notify(IndexingEvent(obj))
```

### 2. ZenHub Connection Timeout
Check:
- ZenHub is running
- Port 8789 accessible
- Credentials correct

### 3. Stale ZODB Connection
```python
# Sync with database
dmd._p_jar.sync()
```

### 4. Permission Denied
```python
# Check required decorator
@require("ZEN_ADMIN_DEVICE")  # For facades
@contextRequire("Manage DMD", "uid")  # For routers
```

## Performance Tips

### Bulk Operations
```python
# Use catalog for queries, not traversal
from Products.Zuul.catalog.interfaces import IModelCatalogTool
catalog = IModelCatalogTool(dmd)
results = catalog.search(types=["Products.ZenModel.Device.Device"])
```

### Batch Commits
```python
for i, obj in enumerate(large_list):
    process(obj)
    if i % 100 == 0:
        transaction.commit()
transaction.commit()
```

### Avoid N+1 Queries
Use batch loading via catalog rather than iterating relationships.

## Security

### zProperties with Secrets
- `zSnmpCommunity`, `zCommandPassword`, etc.
- Masked in UI via `getPasswordFields()`
- Never log sensitive values

### Audit Logging
```python
from Products.ZenMessaging.audit import audit
audit("UI.Device.Add", device_uid, description="Added device")
```

## Twisted Patterns

### Deferred Chains
```python
from twisted.internet import defer

@defer.inlineCallbacks
def async_method(self):
    result1 = yield self.callRemote("method1")
    result2 = yield self.callRemote("method2", result1)
    defer.returnValue(result2)
```

### Error Handling
```python
def errback(failure):
    log.error("Error: %s", failure.getErrorMessage())
    return failure

d.addErrback(errback)
```

## ZenPack Development

### Required Structure
```
ZenPacks.mycompany.mypack/
├── setup.py
├── ZenPacks/
│   └── mycompany/
│       └── mypack/
│           ├── __init__.py
│           └── ...
```

### Model Extensions
- Add new device types by subclassing Device
- Add components by subclassing DeviceComponent
- Use `_relations` for relationships
