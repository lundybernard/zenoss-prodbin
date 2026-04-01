#!/usr/bin/env python

import os
import unittest

import common


class Test_addRedisLogFilters(unittest.TestCase, common.ServiceMigrationTestCase):
    """
    Test that the log filter for Redis is added as expected.
    """
    initial_servicedef = 'zenoss-resmgr-5.2.3.json'
    expected_servicedef = 'zenoss-resmgr-5.2.3-addRedisLogFilters.json'
    migration_module_name = 'addRedisLogFilters'
    migration_class_name = 'AddRedisLogFilters'

    expected_log_filters = dict()
    filterName = "redis"
    datafile = 'data/%s-6.0.0.conf' % filterName
    filename = os.path.join(os.path.dirname(__file__), "..", datafile)
    with open(filename) as filterFile:
        filterDef = filterFile.read()
        expected_log_filters[filterName] = filterDef

if __name__ == '__main__':
    unittest.main()
