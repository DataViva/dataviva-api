from decimal import Decimal
from flask.json import JSONEncoder

class ApiJSONEncoder(JSONEncoder):

    def default(self, obj):
        try:
            if isinstance(obj, Decimal):
                return str(obj)
            iterable = iter(obj)
        except TypeError:
            pass
        else:
            return list(iterable)
        return JSONEncoder.default(self, obj)