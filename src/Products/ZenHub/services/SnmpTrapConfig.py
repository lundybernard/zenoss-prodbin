##############################################################################
#
# Copyright (C) Zenoss, Inc. 2011, all rights reserved.
#
# This content is made available according to terms specified in
# License.zenoss under the directory where your Zenoss product is installed.
#
##############################################################################

"""SnmpTrapConfig

Provides configuration for an OID translation service.
"""

from __future__ import absolute_import, print_function

import json
import logging

from hashlib import md5

from pynetsnmp import usm
from twisted.spread import pb

from Products.ZenHub.HubService import HubService
from Products.Zuul.catalog.interfaces import IModelCatalogTool

log = logging.getLogger("zen.HubService.SnmpTrapConfig")

SNMPV3_USER_ZPROPS = [
    "zSnmpEngineId",
    "zSnmpSecurityName",
    "zSnmpAuthType",
    "zSnmpAuthPassword",
    "zSnmpPrivType",
    "zSnmpPrivPassword",
]


class FakeDevice(object):
    id = "MIB payload"


class User(usm.User, pb.Copyable, pb.RemoteCopy):
    def getStateToCopy(self):
        state = {}
        state["name"] = self.name
        state["engine"] = self.engine
        state["context"] = self.context

        if self.auth is not None and getattr(self.auth, "passphrase", None) is not None:
            state["auth"] = [self.auth.protocol.name, self.auth.passphrase]
        else:
            state["auth"] = None

        if self.priv is not None and getattr(self.priv, "passphrase", None) is not None:
            state["priv"] = [self.priv.protocol.name, self.priv.passphrase]
        else:
            state["priv"] = None

        return state

    def setCopyableState(self, state):
        auth_args = state.get("auth")
        auth = usm.Authentication(*auth_args) if auth_args else None

        priv_args = state.get("priv")
        priv = usm.Privacy(*priv_args) if priv_args else None

        usm.User.__init__(
            self,
            state.get("name"),
            auth=auth,
            priv=priv,
            engine=state.get("engine"),
            context=state.get("context")
        )

    def __hash__(self):
        return hash((self.name, self.engine, self.context))


pb.setUnjellyableForClass(User, User)


class SnmpTrapConfig(HubService):
    """
    Configuration service for the zentrap collection daemon.
    """

    def remote_createAllUsers(self):
        try:
            cat = IModelCatalogTool(self.dmd)
            brains = cat.search(
                (
                    "Products.ZenModel.Device.Device",
                    "Products.ZenModel.DeviceClass.DeviceClass",
                )
            )
            log.debug(
                "Found %s potential objects for SNMPv3 user creation",
                len(brains),
            )

            users = set()
            for brain in brains:
                try:
                    device = brain.getObject()
                    user = self._create_user(device)
                    if user is not None:
                        users.add(user)
                except Exception as ex:
                    log.warn("Failed to process object %s for SNMPv3: %s", brain.getPath(), ex)
                    continue

            log.debug("SnmpTrapConfig.remote_createAllUsers %s users", len(users))
            return list(users)
        except Exception as e:
            log.error("Failed to gather SNMPv3 users: %s", e)
            return []

    def remote_getTrapFilters(self, remoteCheckSum):
        currentCheckSum = md5(self.zem.trapFilters).hexdigest()  # noqa S324
        return (
            (None, None)
            if currentCheckSum == remoteCheckSum
            else (currentCheckSum, self.zem.trapFilters)
        )

    def remote_getOidMap(self, remoteCheckSum):
        oidMap = {b.oid: b.id for b in self.dmd.Mibs.mibSearch() if b.oid}
        currentCheckSum = md5(  # noqa S324
            json.dumps(oidMap, sort_keys=True).encode("utf-8")
        ).hexdigest()
        return (
            (None, None)
            if currentCheckSum == remoteCheckSum
            else (currentCheckSum, oidMap)
        )

    def _create_user(self, obj):
        # Users are only valid for SNMP v3.
        if getattr(obj, "zSnmpVer", None) != "v3":
            return

        securityName = getattr(obj, "zSnmpSecurityName", None)
        if not securityName:
            log.debug(
                "Skipping %s: zSnmpVer is v3 but zSnmpSecurityName is empty",
                obj.id,
            )
            return

        try:
            return User(
                securityName,
                auth=usm.Authentication(
                    getattr(obj, "zSnmpAuthType", ""),
                    getattr(obj, "zSnmpAuthPassword", "")
                ),
                priv=usm.Privacy(
                    getattr(obj, "zSnmpPrivType", ""),
                    getattr(obj, "zSnmpPrivPassword", "")
                ),
                engine=getattr(obj, "zSnmpEngineId", None),
                context=getattr(obj, "zSnmpContext", ""),
            )
        except Exception as ex:
            log.warn(
                "Failed to create SNMP Security user for %s: %s",
                obj.id, ex
            )
            return None

    def _objectUpdated(self, object):
        user = self._create_user(object)
        if user:
            for listener in self.listeners:
                listener.callRemote("createUser", user)


if __name__ == "__main__":
    from pprint import pprint
    from Products.ZenHub.ServiceTester import ServiceTester

    class TrapTester(ServiceTester):
        def buildOptions(self):
            ServiceTester.buildOptions(self)
            self.parser.add_option(
                "--resolve",
                dest="request",
                help="Specify a specific OID or name to map to the name or OID.",
            )
            self.parser.add_option(
                "--exactMatch",
                dest="exactMatch",
                action="store_true",
                default=True,
                help="When resolving to name, use an exact match",
            )
            self.parser.add_option(
                "--fuzzyMatch",
                dest="exactMatch",
                action="store_false",
                help="When resolving to name, don't use an exact match",
            )
            self.parser.add_option(
                "--list",
                dest="list",
                action="store_true",
                default=False,
                help="List all OIDs?",
            )

        def resolve(self):
            name = self.dmd.Mibs.oid2name(
                self.options.request, exactMatch=self.options.exactMatch
            )
            if name:
                log.info("\t%s => %s", self.options.request, name)

            oid = self.dmd.Mibs.name2oid(self.options.request)
            if oid:
                log.info("\t%s => %s", self.options.request, oid)

        def list(self):
            dev = FakeDevice()
            proxy = self.service._createDeviceProxy(dev)
            pprint(proxy.oidMap)

        def printer(self, config):
            print("\t%s => %s" % (config.id, config.oidMap))

        def run(self):
            if self.options.request:
                self.resolve()
            elif self.options.list:
                self.list()
            else:
                self.showDeviceInfo()

    tester = TrapTester(SnmpTrapConfig)
    tester.run()
