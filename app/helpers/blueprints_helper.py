from os import getcwd, path
from importlib import import_module
from pkgutil import walk_packages


def register_blueprints(flask, package):
    package_dir = path.join(getcwd(), flask.name, package)

    blueprints = [import_module(f"{flask.name}.{package}.{module.name}").blueprint
                  for module in walk_packages([package_dir])]

    for blueprint in blueprints:
        flask.register_blueprint(blueprint)
