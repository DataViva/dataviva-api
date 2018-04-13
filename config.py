from os import getenv


class Config(object):
    DEBUG = False
    TESTING = False
    HIDE_DATA = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    REDIS_HOST = getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = getenv('REDIS_PORT', '6379')
    REDIS_DB = getenv('REDIS_DB', '0')

    CACHE_TYPE = 'redis'
    CACHE_KEY_PREFIX = 'api'
    CACHE_DEFAULT_TIMEOUT = 60000000

    S3_ACCESS_KEY = getenv("S3_ACCESS_KEY")
    S3_SECRET_KEY = getenv("S3_SECRET_KEY")

    SQLALCHEMY_DATABASE_URI = "redshift+psycopg2://{0}:{1}@{2}/{3}".format(
        getenv("DATAVIVA_REDSHIFT_USER"),
        getenv("DATAVIVA_REDSHIFT_PW"),
        getenv("DATAVIVA_REDSHIFT_HOST"),
        getenv("DATAVIVA_REDSHIFT_NAME"))


class Production(Config):
    pass


class Development(Config):
    HIDE_DATA = False
    DEBUG = True


class Testing(Config):
    TESTING = True
    CACHE_TYPE = 'null'
