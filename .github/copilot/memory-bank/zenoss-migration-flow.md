# Zenoss Migration (Upgrade) System - Detailed Flow

## Overview

The migration system in `Products.ZenModel.migrate/` handles schema and data changes across Zenoss versions. It ensures the ZODB database structure matches the code expectations after upgrades.

## Entry Point

```bash
zenmigrate    # Console script defined in setup.cfg
```

Maps to: `Products.ZenModel.migrate.zenmigrate:main`

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     zenmigrate CLI                              │
│              (Products.ZenModel.migrate.zenmigrate)             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. REGISTRATION PHASE                                           │
│    _register_migration_scripts() imports ALL *.py files from    │
│    Products.ZenModel.migrate/ directory                         │
│                                                                  │
│    Each Step subclass __init__ calls: allSteps.append(self)    │
│    This is how steps self-register globally                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. INITIALIZATION                                               │
│    Migration.__init__():                                        │
│    - Connects to ZODB via ZenScriptBase                        │
│    - Copies allSteps to self.allSteps                          │
│    - Sorts steps by version + dependencies                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. VERSION COMPARISON                                           │
│    currentDbVers = self._currentVersion()                       │
│    - Reads dmd.version from ZODB                               │
│    - Parses to Version object                                  │
│    - Example: "Zenoss 7.2.0" → Version(7, 2, 0)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. STEP SELECTION (determineSteps)                              │
│                                                                  │
│    Option A: --step=StepName                                    │
│    → Run only steps matching the name pattern                   │
│                                                                  │
│    Option B: --level=X.Y.Z                                      │
│    → Run all steps where step.version >= level                  │
│                                                                  │
│    Option C: Default                                            │
│    → Run steps where step.version > dmd.version                 │
│    → If no newer steps exist, re-run current version steps     │
│    → Unless --newer flag, then run nothing                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. EXECUTION (migrate method)                                   │
│                                                                  │
│    for step in steps:                                           │
│        step.prepare()        # Pre-cutover setup               │
│                                                                  │
│    for step in steps:                                           │
│        log("Installing StepName (version)")                     │
│        step.cutover(dmd)     # Main migration logic            │
│        dmd.version = step.version  # Bump if newer             │
│        executed.append(step)                                    │
│                                                                  │
│    for step in steps:                                           │
│        step.cleanup()        # Post-cutover cleanup            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. POST-MIGRATION TASKS                                         │
│    - cleanup(): Remove .pyc files from Products/               │
│    - ReportLoader: Reload reports with force=True              │
│    - ZenPortletManager.update_source(): Update JS portlets     │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ SUCCESS PATH            │     │ FAILURE PATH            │
│                         │     │                         │
│ if --commit (default):  │     │ transaction.abort()     │
│   transaction.commit()  │     │                         │
│   dmd.version updated   │     │ for step in executed:   │
│                         │     │   step.revert()         │
│ if --dont-commit:       │     │                         │
│   transaction.abort()   │     │ Exception re-raised     │
│   (dry run)             │     │                         │
└─────────────────────────┘     └─────────────────────────┘
```

## Key Classes

### Migrate.Step (Base Class)

```python
class Step(object):
    version = -1           # REQUIRED: Version(major, minor, micro)
    dependencies = None    # Optional: [OtherStep, ...]
    
    def __init__(self):
        allSteps.append(self)  # Self-registration
    
    def prepare(self):
        """Pre-cutover setup (optional)"""
        pass
    
    def cutover(self, dmd):
        """Main migration logic - REQUIRED"""
        raise NotImplementedError
    
    def cleanup(self):
        """Post-cutover cleanup (optional)"""
        pass
    
    def revert(self):
        """Rollback on failure (optional)"""
        pass
```

### Migrate.Version

```python
from Products.ZenModel.migrate.Migrate import Version

# Version(major, minor, micro)
v = Version(7, 3, 1)

# Comparison operators work
v1 < v2   # True if v1 is older
v1 == v2  # True if same version

# String representation
v.short()  # "7.3.1"
v.long()   # "Zenoss 7.3.1"
```

### Migrate.Migration (Main Driver)

```python
class Migration(ZenScriptBase):
    def determineSteps(self):
        """Select which steps to run based on options and dmd.version"""
    
    def migrate(self, steps, executed):
        """Execute the selected steps"""
    
    def cutover(self):
        """Main entry point - backup, migrate, success/recover"""
    
    def recover(self):
        """Rollback on failure"""
    
    def success(self):
        """Commit or rollback based on options"""
```

## Step Ordering Rules

1. **Version Order**: Steps sorted by `step.version` (oldest first)
2. **Dependencies**: If step A depends on step B, B runs before A
3. **Name Order**: For same version, alphabetical by class name

## Common Migration Patterns

### Adding zProperties

```python
class AddMyProperty(Migrate.Step):
    version = Migrate.Version(7, 3, 1)
    
    def cutover(self, dmd):
        if not dmd.Devices.hasProperty("zMyProp"):
            dmd.Devices._setProperty("zMyProp", "default", type="string")
```

### Reindexing Objects

```python
class ReindexDevices(Migrate.Step):
    version = Migrate.Version(7, 3, 1)
    
    def cutover(self, dmd):
        from Products.Zuul.catalog.events import IndexingEvent
        from zope.event import notify
        
        for device in dmd.Devices.getSubDevices():
            notify(IndexingEvent(device))
```

### Adding Event Classes

```python
class AddEventClass(Migrate.Step):
    version = Migrate.Version(7, 3, 1)
    
    def cutover(self, dmd):
        if not dmd.Events.find("/MyEvents"):
            ec = dmd.Events.createOrganizer("/MyEvents")
            ec.transform = "evt.severity = 3"
```

### Modifying Existing Objects

```python
class UpdateThreshold(Migrate.Step):
    version = Migrate.Version(7, 3, 1)
    
    def cutover(self, dmd):
        for template in dmd.Devices.getAllRRDTemplates():
            for threshold in template.thresholds():
                if threshold.id == "high_load":
                    threshold.maxval = "10"
```

## CLI Options Reference

| Option | Description |
|--------|-------------|
| `--step=NAME` | Run only matching step(s), can repeat |
| `--level=X.Y.Z` | Run all steps >= version |
| `--newer` | Only run steps newer than dmd.version |
| `--list` | Show all steps and their status |
| `--dont-commit` | Dry run, rollback at end |
| `--dont-bump` | Don't update dmd.version |

## Troubleshooting

### Check Current Database Version

```python
# In zendmd:
print(dmd.version)  # e.g., "Zenoss 7.2.0"
```

### List All Available Steps

```bash
zenmigrate --list
```

### Run Specific Step for Testing

```bash
zenmigrate --step=MyStepName --dont-commit
```

### Force Re-run Current Version Steps

```bash
zenmigrate  # Without --newer, re-runs current version
```

### Debug a Failing Migration

```bash
zenmigrate --step=FailingStep --dont-commit -v 10
```

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `version = -1` | Step missing version | Add `version = Migrate.Version(X, Y, Z)` |
| `NotImplementedError` | Missing cutover | Implement `cutover(self, dmd)` method |
| Circular dependency | Step lists itself | Check `dependencies` list |
| Step not found | Typo in --step | Check exact class name |

## Files and Locations

| Path | Purpose |
|------|---------|
| `Products.ZenModel.migrate/Migrate.py` | Framework classes |
| `Products.ZenModel.migrate/zenmigrate.py` | Entry point |
| `Products.ZenModel.migrate/*.py` | Individual migration steps |
| `$ZENHOME/log/zenmigrate.log` | Migration log file |

## Integration with Service Upgrades

In containerized deployments, migrations typically run:
1. During service startup (via init scripts)
2. After code update, before service is ready
3. Controlled by Control Center service definitions

## Best Practices for Writing Steps

1. **Idempotent**: Step should be safe to run multiple times
2. **Check First**: Always check if change already applied
3. **Atomic**: Either complete fully or rollback cleanly
4. **Documented**: Include docstring explaining the change
5. **Versioned**: Use correct version for release cycle
6. **Tested**: Create test in `Products.ZenModel.migrate.tests/`
