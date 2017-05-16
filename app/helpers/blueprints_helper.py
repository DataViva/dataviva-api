from os import listdir, getcwd, path
from re import sub
from importlib import import_module
from inflection import singularize


def register_blueprints(flask, package):
    package_dir = path.join(getcwd(), flask.name, package)
    module_suffix = '_' + singularize(package) + '.py'

    module_names = [sub('\.py$', '', c)
                    for c in listdir(package_dir) if c.endswith(module_suffix)]

    for module_name in module_names:
        module = import_module(flask.name + '.%s.%s' % (package, module_name))
        flask.register_blueprint(module.blueprint)
