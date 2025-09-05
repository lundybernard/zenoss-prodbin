##############################################################################
#
# Copyright (C) Zenoss, Inc. 2025 all rights reserved.
#
# This content is made available according to terms specified in
# License.zenoss under the directory where your Zenoss product is installed.
#
##############################################################################

SEARCH_MODEL_CATALOG_PATH = "Products.Zuul.catalog.model_catalog_tool.ModelCatalogTool.search_model_catalog"

def wrapped_search_model_catalog(self, query, start=0, limit=None, order_by=None, reverse=False,
                                 fields=None, commit_dirty=False, facets_for_field=None):
    """
    patch for ModelCatalogTool.search_model_catalog to exclude localhost device
    """
    from zenoss.modelindex.model_index import SearchParams
    from Products.AdvancedQuery import Eq, Not, And
    query = And(query, Not(Eq("name", "127.0.0.1"))) # Exclude localhost devices
    search_params = SearchParams(query, start=start, limit=limit, order_by=order_by, reverse=reverse, fields=fields)
    if facets_for_field:
        search_params.facet_field=facets_for_field
    catalog_results = self.model_catalog_client.search(search_params, self.context, commit_dirty=commit_dirty)
    return catalog_results