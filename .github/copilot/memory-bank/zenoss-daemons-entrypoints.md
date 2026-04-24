# Zenoss Prodbin - Daemons and Entry Points

## Daemon Hierarchy

```
CmdBase
  └── ZenDaemon (basic daemon with PID file, daemonization)
        └── ZCmdBase (adds ZODB connection)
              └── PBDaemon (adds ZenHub connection via Twisted PB)
                    └── RRDDaemon (adds metrics collection)
                          └── CollectorDaemon (full collection framework)
```

## Core Daemons

### Collection Daemons
| Daemon | Purpose | Base Class |
|--------|---------|------------|
| zencommand | SSH/command-based collection | CollectorDaemon |
| zenperfsnmp | SNMP performance data | CollectorDaemon |
| zenprocess | Process monitoring | CollectorDaemon |
| zenping | Ping monitoring | CollectorDaemon |
| zenstatus | Port/service status | CollectorDaemon |

### Event Daemons
| Daemon | Purpose | Base Class |
|--------|---------|------------|
| zeneventd | Event processing | ZCmdBase |
| zenactiond | Notification actions | PBDaemon |
| zensyslog | Syslog collection | ZCmdBase |
| zentrap | SNMP trap collection | ZCmdBase |

### Infrastructure Daemons
| Daemon | Purpose | Base Class |
|--------|---------|------------|
| zenhub | Central collection hub | ZCmdBase |
| zenhubworker | Hub worker processes | ZCmdBase |
| zenjobs | Celery job workers | - |

### Modeling Daemons
| Daemon | Purpose | Base Class |
|--------|---------|------------|
| zenmodeler | Device modeling | PBDaemon |
| zendisc | Device discovery | ZCmdBase |

## Entry Points (console_scripts)

### Core Commands
```
zendmd          - Interactive Zenoss shell
zenmigrate      - Run migrations
zenbuild        - Build Zenoss DMD
zencatalog      - Catalog management
```

### Device Management
```
zenbatchload    - Batch device import
zenbatchdump    - Batch device export
zenpack         - ZenPack management
```

### Collection Management
```
configcache     - Config cache management
zenpackdaemons  - ZenPack daemon registration
```

### Event Management
```
zensendevent    - Send test events
zenackevents    - Acknowledge events
```

### Utilities
```
dcsh            - Distributed command shell
zenchkrels      - Check relationships
zenchkschema    - Check schema
zendb           - Database utilities
reportloader    - Load reports
reportmail      - Email reports
```

## Daemon Options

### Common Options
```python
parser.add_option("--daemon", action="store_true")
parser.add_option("--pidfile", dest="pidfile")
parser.add_option("--logfile", dest="logfile")
parser.add_option("-v", "--logseverity", type="int")
```

### ZenHub Connection Options
```python
parser.add_option("--hubhost", default="localhost")
parser.add_option("--hubport", type="int", default=8789)
parser.add_option("--hubusername", default="admin")
parser.add_option("--hubpassword", default="zenoss")
```

## Creating a New Collector

```python
from Products.ZenCollector.daemon import CollectorDaemon
from Products.ZenCollector.interfaces import ICollectorPreferences

@implementer(ICollectorPreferences)
class MyCollectorPreferences:
    collectorName = "mycollector"
    configurationService = "Products.ZenHub.services.MyConfig"
    cycleInterval = 300
    
class MyCollector(CollectorDaemon):
    def __init__(self):
        super(MyCollector, self).__init__(
            MyCollectorPreferences(),
            myTaskSplitter,
        )
```

## Daemon Lifecycle
1. Parse command line options
2. Initialize logging
3. Daemonize (if `--daemon`)
4. Write PID file
5. Connect to ZenHub
6. Start reactor/main loop
7. Clean up on shutdown
