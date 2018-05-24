from os import getenv


class Config(object):
    DEBUG = False
    TESTING = False
    HIDE_DATA = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CACHE_TYPE: getenv('CACHE_TYPE', 'redis')
    CACHE_KEY_PREFIX: getenv('CACHE_KEY_PREFIX', 'api')
    CACHE_DEFAULT_TIMEOUT: getenv('CACHE_DEFAULT_TIMEOUT', 60000000)
    CACHE_REDIS_HOST: getenv('CACHE_REDIS_HOST', 'localhost')
    CACHE_REDIS_PORT: getenv('CACHE_REDIS_PORT', 6379)
    CACHE_REDIS_DB: getenv('CACHE_REDIS_DB', 0)

    REDIS_HOST = getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = getenv('REDIS_PORT', '6379')
    REDIS_DB = getenv('REDIS_DB', '0')

    S3_PUBLIC_BUCKET_URL = getenv("S3_PUBLIC_BUCKET_URL")

    SQLALCHEMY_DATABASE_URI = "redshift+psycopg2://{0}:{1}@{2}/{3}".format(
        getenv("DATAVIVA_REDSHIFT_USER"),
        getenv("DATAVIVA_REDSHIFT_PW"),
        getenv("DATAVIVA_REDSHIFT_HOST"),
        getenv("DATAVIVA_REDSHIFT_NAME"),
    )


class Production(Config):
    pass


class Development(Config):
    HIDE_DATA = False
    DEBUG = True


class Testing(Config):
    TESTING = True
    CACHE_TYPE = 'null'
