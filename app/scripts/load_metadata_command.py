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
        redis.set('port/' + str(row['id']), pickle.dumps(row["name"]))

    redis.set('port', pickle.dumps(ports))

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
        redis.set('country/' + str(row['id']), pickle.dumps(country))

    redis.set('country', pickle.dumps(countries))

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

            redis.set('product_section/' + str(row['id']), pickle.dumps(section))
            sections[row['id']] = section

        elif row['profundidade'] == 'Capítulo':
            chapter = {
                'name_pt': row["name_pt"],
                'name_en': row["name_en"],
                'section': row["id"][:2]
            }

            redis.set('product_chapter/' + str(row['id']), pickle.dumps(chapter))
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
            redis.set('product/' + str(product_id), pickle.dumps(product))

    redis.set('product', pickle.dumps(products))
    redis.set('product_section', pickle.dumps(sections))
    redis.set('product_chapter', pickle.dumps(chapters))

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
        redis.set('state/' + str(row['ibge_id']), pickle.dumps(row["mdic_name"]))

    redis.set('state', pickle.dumps(states))

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
        redis.set('continent/' + str(row['id']), pickle.dumps(continent))

    redis.set('continent', pickle.dumps(continents))

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
        redis.set('territory/' + str(row['municipy_id']), pickle.dumps(territory))

    redis.set('territory', pickle.dumps(territories))

    print "Territories loaded."    

def load_economic_blocks():
    csv = read_csv_from_s3('redshift/attrs/attrs_bloco_economico.csv')
    df = pd.read_csv(
        csv,
        sep=';',
        header=0,
        names=['id','name','country_id'],
        converters={
            "country_id": str
        }
    )
    
    economic_blocks = {}

    for _, row in df.iterrows():

        if economic_blocks.get(row["id"]):
            economic_block = economic_blocks[row["id"]]
            economic_block["countries"].append(row["country_id"])
        else:
            economic_block = {
                'name': row["name"],
                'countries': [
                    row["country_id"]
                ]
            }

        economic_blocks[row['id']] = economic_block
        redis.set('economic_block/' + str(row['id']), pickle.dumps(economic_block))

    redis.set('economic_block', pickle.dumps(economic_blocks))

    print "Economic Blocks loaded."

def load_municipalities():
    csv = read_csv_from_s3('redshift/attrs/attrs_municipios.csv')
    df = pd.read_csv(
        csv,
        sep=';',
        header=0,
        names=['uf_id', 'uf_name', 'mesorregion_id', 'mesorregion_name', 'microrregion_id', 'microrregion_name', 'id', 'name', 'municipality_id_mdic'],
        converters={
            "uf_id": str,
            "mesorregion_id": str,
            "microrregion_id": str,
            "id": str,
            "municipality_id_mdic": str
        }
    )

    municipalities = {}

    for _, row in df.iterrows():

        if municipalities.get(row["id"]):
            municipalities = municipality[row["id"]]
            municipality["states"].append(row["uf_id"])
        else:
            municipality = {
                'name': row["name"],
                'mesorregion': {
                    'id': row["mesorregion_id"],
                    'name': row["mesorregion_name"]
                },
                'microrregion': {
                    'id': row["microrregion_id"],
                    'name': row["microrregion_name"]
                },
                'municipality_id_mdic': row["municipality_id_mdic"],
                'states': [
                    row["uf_id"]
                ]
            }

        municipalities[row['id']] = municipality
        redis.set('municipality/' + str(row['id']), pickle.dumps(municipality))

    redis.set('municipality', pickle.dumps(municipalities))

    print "Municipalities loaded."


def load_cnaes():
    csv = read_csv_from_s3('redshift/attrs/attrs_cnae.csv')
    df = pd.read_csv(
        csv,
        sep=';',
        header=0,
        names=['id','name_en','name_pt'],
        converters={
            "id": str
        }
    )

    df2 = pd.DataFrame([
        ['0', 'Undefined', 'Não definido' ], 
        ['00', 'Undefined', 'Não definido' ],
    ], columns=['id','name_en','name_pt'])

    df = df.append(df2, ignore_index=True)

    cnaes = {}
    sections = {}
    divisions = {}
    classes = {}

    for _, row in df.iterrows():

        if len(row['id']) == 1:
            section = {
                'name_pt': row["name_pt"],
                'name_en': row["name_en"]
            }

            redis.set('cnae_section/' + str(row['id']), pickle.dumps(section))
            sections[row['id']] = section

        elif len(row['id']) == 3:
            division = {
                'name_pt': row["name_pt"],
                'name_en': row["name_en"],
                'section': row["id"][0]
            }

            division_id = row['id'][1:3]

            redis.set('cnae_division/' + str(division_id), pickle.dumps(division))
            divisions[division_id] = division

        elif len(row['id']) == 6:
            classe = {
                'name_pt': row["name_pt"],
                'name_en': row["name_en"],
                'section': row["id"][0],
                'division': row["id"][1:3]
            }

            classes[row["id"][1:]] = classe
            redis.set('cnae/' + str(id), pickle.dumps(classe))

    redis.set('cnae', pickle.dumps(classes))
    redis.set('cnae_division', pickle.dumps(divisions))
    redis.set('cnae_section', pickle.dumps(sections))


    print "CNAEs loaded."   


def load_genders():
    csv = read_csv_from_s3('redshift/attrs/attrs_generos.csv')
    df = pd.read_csv(
        csv,
        sep=';',
        header=0,
        names=['id', 'name_pt', 'name_en']
    )

    genders = {}

    for _, row in df.iterrows():
        gender = {
            'name_pt': row["name_pt"],
            'name_en': row["name_en"]
        }

        genders[row['id']] = gender
        redis.set('gender/' + str(row['id']), pickle.dumps(gender))

    redis.set('gender', pickle.dumps(genders))

    print "Genders loaded."


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
        load_economic_blocks()
        load_municipalities()
        load_cnaes()
        load_genders()
