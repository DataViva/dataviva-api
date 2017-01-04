# -*- coding: utf-8 -*-
from flask_script import Command
from os import getenv, environ
from flask import jsonify
import time
import boto3
import pickle
import pandas as pd
from app import redis, flask


def read_csv_from_s3(filename):
    client = boto3.client(
        's3',
        aws_access_key_id=flask.config['S3_ACCESS_KEY'],
        aws_secret_access_key=flask.config['S3_SECRET_KEY']
    )

    obj = client.get_object(Bucket='dataviva-etl', Key=filename)
    
    return obj['Body']

def load_ports():
    csv = read_csv_from_s3('redshift/attrs/attrs_porto.csv')
    df = pd.read_csv(
        csv,
        sep=';',
        header=0,
        names=['id', 'name']
    )

    ports = {}

    for index, row in df.iterrows():
        ports[row['id']] = row["name"]
        redis.set('ports/' + str(row['id']), pickle.dumps(row["name"]))

    redis.set('ports', pickle.dumps(ports))

    print "Ports loaded."

def load_countries():
    csv = read_csv_from_s3('redshift/attrs/attrs_wld.csv')
    df = pd.read_csv(
        csv,
        sep=';',
        header=0,
        names=['id', 'name_pt', 'name_en']
    )

    countries = {}

    for _, row in df.iterrows():
        country = {
            'name_pt': row["name_pt"],
            'name_en': row["name_en"]
        }

        countries[row['id']] = country
        redis.set('countries/' + str(row['id']), pickle.dumps(country))

    redis.set('countries', pickle.dumps(countries))

    print "Countries loaded."


def load_products():
    csv = read_csv_from_s3('redshift/attrs/attrs_hs.csv')
    df = pd.read_csv(
        csv,
        sep=';',
        header=0,
        names=['id','name_pt','name_en','profundidade_id','profundidade'],
        converters={
            "id": str
        }
    )  

    products = {}
    sections = {}
    chapters = {}

    for _, row in df.iterrows():

        if row['profundidade'] == 'Seção':
            section = {
                'name_pt': row["name_pt"],
                'name_en': row["name_en"]
            }

            redis.set('sections/' + str(row['id']), pickle.dumps(section))
            sections[row['id']] = section

        elif row['profundidade'] == 'Capítulo':
            chapter = {
                'name_pt': row["name_pt"],
                'name_en': row["name_en"],
                'section': row["id"][:2]
            }

            redis.set('chapters/' + str(row['id']), pickle.dumps(chapter))
            chapters[row["id"]] = chapter

        else:
            product = {
                'name_pt': row["name_pt"],
                'name_en': row["name_en"],
                'section': row["id"][:2],
                'chapter': row["id"][2:4]
            }

            product_id = row['id'][2:]

            products[product_id] = product
            redis.set('products/' + str(product_id), pickle.dumps(product))

    redis.set('products', pickle.dumps(products))
    redis.set('sections', pickle.dumps(sections))
    redis.set('chapters', pickle.dumps(chapters))

    print "Products loaded."   


def load_states():
    """
    Rows without ibge_id aren't saving
    """
    csv = read_csv_from_s3('redshift/attrs/attrs_uf_ibge_mdic.csv')
    df = pd.read_csv(
        csv,
        sep=';',
        header=0,
        names=['mdic_name','mdic_id','ibge_id'],
        converters={
            "ibge_id": str
        }
    )  
    
    states = {}

    for _, row in df.iterrows():
        if not row['ibge_id']:
            continue

        states[row['ibge_id']] = row["mdic_name"]
        redis.set('states/' + str(row['ibge_id']), pickle.dumps(row["mdic_name"]))

    redis.set('states', pickle.dumps(states))

    print "States loaded."


def load_continent():
    csv = read_csv_from_s3('redshift/attrs/attrs_continente.csv')
    df = pd.read_csv(
        csv,
        sep=';',
        header=0,
        names=['id','country_id','name_en','name_pt']
        )

    continents = {}


    for _, row in df.iterrows():

        if continents.get(row["id"]):
            continent = continents[row["id"]]
            continent["countries"].append(row["country_id"])
        else:
            continent = {
                'countries': [
                    row["country_id"]
                ],
                'name_en': row["name_en"],
                'name_pt': row["name_pt"]
            }

        continents[row['id']] = continent
        redis.set('continents/' + str(row['id']), pickle.dumps(continent))

    redis.set('continents', pickle.dumps(continents))

    print "Continents loaded."


def load_territories():
    csv = read_csv_from_s3('redshift/attrs/attrs_territorios_de_desenvolvimento.csv')
    df = pd.read_csv(
        csv,
        sep=';',
        header=0,
        names=['territory','microterritory','municipy_id'],
        converters={
            "municipy_id": str
        }
    )

    territories = {}

    for _, row in df.iterrows():
        territory = {
            'territory': row["territory"],
            'microterritory': row["microterritory"],
            'municipy_id': row["municipy_id"]
        }

        territories[row['municipy_id']] = territory
        redis.set('territories/' + str(row['municipy_id']), pickle.dumps(territory))

    redis.set('territories', pickle.dumps(territories))

    print "Territories loaded."    


    

class LoadMetadataCommand(Command):
    """
    Load the Redis database
    """

    def run(self):
        load_states()
        load_ports()
        load_countries()
        load_products()
        load_continent()
        load_territories()

