from os import getcwd, path, getenv


class Config(object):
    DEBUG = False
    TESTING = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    REDIS_HOST = 'localhost'
    REDIS_PORT = '6379'
    REDIS_DB = '0'
    S3_ACCESS_KEY = getenv("S3_ACCESS_KEY")
    S3_SECRET_KEY = getenv("S3_SECRET_KEY")


class Production(Config):
    SQLALCHEMY_DATABASE_URI = "redshift+psycopg2://{0}:{1}@{2}/{3}".format(
        getenv("DATAVIVA_REDSHIFT_USER"),
        getenv("DATAVIVA_REDSHIFT_PW"),
        getenv("DATAVIVA_REDSHIFT_HOST"),
        getenv("DATAVIVA_REDSHIFT_NAME"))
    REDIS_HOST = getenv("REDIS_HOST")
    REDIS_PORT = getenv("REDIS_PORT")
    REDIS_DB = getenv("REDIS_DB")


class Development(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "postgresql:///dataviva"

    

class Testing(Config):
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite://'