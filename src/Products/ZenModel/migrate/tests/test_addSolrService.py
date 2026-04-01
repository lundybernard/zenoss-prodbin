#!/usr/bin/env python

import os
import unittest

import common


class Test_addSolrService(unittest.TestCase, common.ServiceMigrationTestCase):
    """
    Test that missedRuns threshold is added to collector services.
    """
    initial_servicedef = 'zenoss-resmgr-5.1.5_badSolrEP.json'
    expected_servicedef = 'zenoss-resmgr-5.1.5-addSolrService.json'
    migration_module_name = 'addSolrService'
    migration_class_name = 'AddSolrService'

    expected_log_filters = dict()
    filterName = "solr"
    datafile = 'data/%s-6.0.0.conf' % filterName
    filename = os.path.join(os.path.dirname(__file__), "..", datafile)
    with open(filename) as filterFile:
        filterDef = filterFile.read()
        expected_log_filters[filterName] = filterDef

if __name__ == '__main__':
    unittest.main()
