import unicodedata

import six


def load_trap_filters():
    import os.path

    path = os.path.join(os.path.dirname(__file__), "trap_filters.txt")
    with open(path) as f:
        return f.read()


def load_syslog_parsers():
    import json
    import os.path

    path = os.path.join(os.path.dirname(__file__), "syslog_parsers.json")
    with open(path) as f:
        return json.load(f, object_pairs_hook=_as_bytes)


def _as_bytes(pairs):
    return {str(k): _encode(v) for k, v in pairs}


def _encode(value):
    if isinstance(value, six.text_type):
        return unicodedata.normalize("NFKD", value).encode("ascii", "ignore")
    return value
