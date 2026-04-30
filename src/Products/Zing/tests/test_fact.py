##############################################################################
#
# Copyright (C) Zenoss, Inc. 2026, all rights reserved.
#
# This content is made available according to terms specified in
# License.zenoss under the directory where your Zenoss product is installed.
#
##############################################################################

from __future__ import absolute_import

from unittest import TestCase
from Products.ZenModel.Device import Device
from Products.ZenModel.Hardware import Hardware
from Products.Zing.fact import device_info_fact, MetadataKeys


class DummyDevice(Device):
    id = "test_device"
    title = "Test Device"
    
    def __init__(self):
        pass

    def titleOrId(self): return self.title
    def _propertyMap(self): return []
    def device(self): return None
    def getProductionState(self): return 1000
    def getPriorityConversions(self): return {}
    def getProdStateConversions(self): return {}
    def convertProdState(self, state): return "Production"
    
    def getOSProductKey(self): return ("os_model", "os_manufacturer")
    def getHWProductKey(self): return ("device_hw_model", "device_hw_manufacturer")
    def getHWTag(self): return "device_hw_tag"
    def getHWSerialNumber(self): return "device_hw_sn"


class DummyHardwareComponent(Hardware):
    id = "test_hw_comp"
    title = "Test HW Comp"
    
    tag = "comp_hw_tag"
    serialNumber = "comp_hw_sn"

    def __init__(self):
        pass

    def titleOrId(self): return self.title
    def _propertyMap(self): return []
    def device(self): return None
    def getProductionState(self): return 1000
    def getPriorityConversions(self): return {}
    def getProdStateConversions(self): return {}
    def convertProdState(self, state): return "Production"
    
    def getOSProductKey(self): return ("os_model", "os_manufacturer")
    def getProductKey(self): return ("comp_hw_model", "comp_hw_manufacturer")
    def getHWProductKey(self): return ("device_hw_model", "device_hw_manufacturer")
    def getHWTag(self): return "device_hw_tag"
    def getHWSerialNumber(self): return "device_hw_sn"


class TestFactGeneration(TestCase):

    def test_device_hardware_extraction(self):
        """
        Verify that device_info_fact correctly extracts hardware properties 
        from a standard Device object using the fallback methods.
        """
        device = DummyDevice()
        fact = device_info_fact(device)

        self.assertEqual(fact.data.get(MetadataKeys.HW_MODEL), "device_hw_model")
        self.assertEqual(fact.data.get(MetadataKeys.HW_MANUFACTURER), "device_hw_manufacturer")
        self.assertEqual(fact.data.get(MetadataKeys.HW_TAG), "device_hw_tag")
        self.assertEqual(fact.data.get(MetadataKeys.HW_SERIAL_NUMBER), "device_hw_sn")

    def test_hardware_component_extraction(self):
        """
        Verify that device_info_fact extracts hardware properties directly from 
        a component that inherits from Hardware, rather than falling back to the 
        parent device methods.
        """
        hw_comp = DummyHardwareComponent()
        fact = device_info_fact(hw_comp)

        self.assertEqual(fact.data.get(MetadataKeys.HW_MODEL), "comp_hw_model")
        self.assertEqual(fact.data.get(MetadataKeys.HW_MANUFACTURER), "comp_hw_manufacturer")
        self.assertEqual(fact.data.get(MetadataKeys.HW_TAG), "comp_hw_tag")
        self.assertEqual(fact.data.get(MetadataKeys.HW_SERIAL_NUMBER), "comp_hw_sn")
