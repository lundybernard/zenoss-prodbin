#!/usr/bin/env python

import os
import unittest

import common


class Test_fixMetricShipperLogFilters(unittest.TestCase, common.ServiceMigrationTestCase):
    """
    Test that the log filter for MetricShipper is fixed as expected.
    """
    initial_servicedef = 'zenoss-resmgr-5.1.5.json'
    expected_servicedef = 'zenoss-resmgr-5.1.5-fixMetricShipperLogFilters.json'
    migration_module_name = 'fixMetricShipperLogFilters'
    migration_class_name = 'FixMetricShipperLogFilters'

    expected_log_filters = dict()
    filterName = "glog"
    datafile = 'data/%s-6.0.0.conf' % filterName
    filename = os.path.join(os.path.dirname(__file__), "..", datafile)
    with open(filename) as filterFile:
        filterDef = filterFile.read()
        expected_log_filters[filterName] = filterDef

if __name__ == '__main__':
    unittest.main()
