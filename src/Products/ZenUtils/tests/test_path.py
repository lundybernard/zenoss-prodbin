##############################################################################
#
# Copyright (C) Zenoss, Inc. 2008, 2013 all rights reserved.
#
# This content is made available according to terms specified in
# License.zenoss under the directory where your Zenoss product is installed.
#
##############################################################################

import unittest

from zope.testing.doctestunit import DocTestSuite


def test_suite():
    tests = [DocTestSuite("Products.ZenUtils.path")]
    return unittest.TestSuite(tests)
