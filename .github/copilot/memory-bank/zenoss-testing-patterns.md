# Zenoss Prodbin - Testing Patterns

## Test Infrastructure

### Test Commands
```bash
make test           # Run via CI (Docker)
bin/runtests        # Direct test runner
bin/runtests.py     # Python test runner
```

### Test Frameworks
- **Zope TestRunner** - Unit tests with ZODB
- **Behave** - BDD feature tests (`bdd/`)
- **Jasmine** - JavaScript tests (`tests/jasmine/`)

## Unit Testing

### Base Classes
```python
from Products.ZenTestCase.BaseTestCase import BaseTestCase
from Products.ZenModel.tests.ZenModelBaseTest import ZenModelBaseTest

class TestMyFeature(ZenModelBaseTest):
    def test_something(self):
        # Access dmd via self.dmd
        device = self.dmd.Devices.createInstance("test-device")
        self.assertEqual(device.id, "test-device")
```

### Test File Locations
- `Products.*/tests/` - Product-specific tests
- `test_*.py` or `*Test.py` - Test file naming

### ZODB Test Setup
- `BaseTestCase` provides `self.dmd` (DataRoot)
- `DmdBuilder` creates test DMD structure
- Uses ZopeTestCase layer for isolation

## BDD Testing (`bdd/`)

### Structure
```
bdd/
├── behave.ini          # Behave configuration
├── context.py          # Test context setup
├── model_catalog/
│   └── features/
│       ├── *.feature   # Feature files
│       └── steps/      # Step definitions
```

### Feature Example
```gherkin
Feature: Basic Zodb data is indexed

Background: Connections to zodb and model catalog are available
    Given I can connect to "zodb"
    and I can connect to "model catalog"

Scenario Outline: All relevant zodb objects are indexed
    Given all "<OBJECT_TYPE>" have been indexed
    When I search for all "<OBJECT_TYPE>" in model catalog
    Then I get all the "<OBJECT_TYPE>" available in Zenoss
```

## JavaScript Testing

### Jasmine Tests
```
tests/jasmine/
├── SpecRunner.html     # Test runner
├── lib/                # Jasmine library
├── spec/               # Test specs
└── src/                # Source files
```

## Test Patterns

### Mocking ZenHub
```python
from Products.ZenUtils.mock import MockHubService
```

### Transaction Handling
Tests run in isolated transactions that are rolled back.

### Model Catalog Testing
```python
from zenoss.modelindex.model_index import SearchParams
from Products.Zuul.catalog.model_catalog import get_solr_config
```

## CI Integration (`ci/`)
```
ci/
├── docker-compose.yaml  # Test environment
├── makefile             # CI make targets
├── runtests.sh          # Test runner script
├── prodbin/             # Test container
├── rabbitmq/            # RabbitMQ config
├── redis/               # Redis config
└── solr/                # Solr config
```

### Running CI Tests
```bash
make -C ci              # Start test environment and run tests
```
