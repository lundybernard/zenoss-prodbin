#!/usr/bin/env python

import unittest
import os.path
import common

class Test_addMariaDBLogFilters(unittest.TestCase, common.ServiceMigrationTestCase):
    """
    Test that the log filter for MariaDB is added as expected.
    """
    initial_servicedef = 'zenoss-resmgr-5.2.3.json'
    expected_servicedef = 'zenoss-resmgr-5.2.3-addMariaDBLogFilters.json'
    migration_module_name = 'addMariaDBLogFilters'
    migration_class_name = 'AddMariaDBLogFilters'

    expected_log_filters = dict()
    filterName = "mariadb"
    datafile = 'data/%s-6.0.0.conf' % filterName
    filename = os.path.join(os.path.dirname(__file__), "..", datafile)
    with open(filename) as filterFile:
        filterDef = filterFile.read()
        expected_log_filters[filterName] = filterDef

if __name__ == '__main__':
    unittest.main()
