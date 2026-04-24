# Zenoss Prodbin - Coding Conventions

## File Headers
All Python files require copyright header:
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

## Python 2/3 Compatibility
Use future imports for Python 2.7:
```python
from __future__ import absolute_import, print_function
```

## Import Organization
1. Standard library
2. Third-party (Zope, Twisted, etc.)
3. Zenoss Products (`from Products.X import ...`)
4. Relative imports (`from .module import ...`)

## Interface Conventions
- Define in `interfaces.py`
- Use `@implementer(IInterface)` decorator
- Prefix with `I` (e.g., `IFacade`, `IInfo`)

## Security Decorators
```python
from Products.Zuul.decorators import contextRequire, require

@contextRequire("Manage DMD", "contextUid")  # For routers
@require("ZEN_ADMIN_DEVICE")                  # For facades
```

## Logging
```python
import logging
log = logging.getLogger("zen.modulename")
```

Use `zen.` prefix for logger names.

## zProperties
- Prefixed with `z` (e.g., `zSnmpCommunity`)
- Define on DeviceClass for inheritance
- Access via `getattr(device, "zPropName")`
- Check with `iszprop()` or `iscustprop()`

## ZODB Transactions
```python
import transaction
transaction.commit()      # Commit changes
transaction.abort()       # Rollback
savepoint = transaction.savepoint()
savepoint.rollback()      # Partial rollback
```

## Testing Conventions
- Test files named `test_*.py` or `*Test.py`
- Inherit from `ZenModelBaseTest` or `BaseTestCase`
- Use `Products.ZenTestCase.BaseTestCase` for ZODB access

## Docstrings
Use module-level docstrings:
```python
"""ModuleName

Description of the module's purpose.
"""
```

## Class Naming
- Model classes: Singular (e.g., `Device`, `IpInterface`)
- Organizers: Singular (e.g., `DeviceClass`, `Location`)
- Routers: Suffix with `Router`
- Facades: Suffix with `Facade`
- Info adapters: Match model name

## Method Patterns
- `_methodName` - Private/internal
- `remote_methodName` - PB remote callable
- `callRemote(methodName, ...)` - Call remote PB method
