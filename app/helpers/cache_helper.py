from flask import get_flashed_messages, request


def api_cache_key(namespace, *args, **kwargs):
    def gen_key(**kwargs):
        path = request.path
        reqstr = ""
        if request.args:
            for k, v in request.args.items():
                reqstr += "&{}={}".format(str(k), str(v))
        key = namespace + ":" + path + reqstr
        cache_key = key.encode('utf-8')

        if get_flashed_messages():
            msgs = "|".join([msg[0] for msg in get_flashed_messages(with_categories=True)])
            cache_key += "/" + msgs

        return cache_key.decode("utf-8")
    return gen_key
