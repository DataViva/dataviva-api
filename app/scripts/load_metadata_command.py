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
            names=['id','name','state']
        )

    ports = {}

    for _, row in df.iterrows():
        port = {
            'name_pt': row["name"] + ' - ' + row["state"],
            'name_en': row["name"] + ' - ' + row["state"]
        }
        ports[row['id']] = port
        redis.set('port/' + str(row['id']), pickle.dumps(port))

    redis.set('port', pickle.dumps(ports))

    print "Ports loaded."

def load_countries():
    csv = read_csv_from_s3('redshift/attrs/attrs_wld.csv')
    df = pd.read_csv(
            csv,
            sep=';',
            header=0,
            names=['id', 'name_pt', 'name_en'],
            converters={
                "id": str
            }
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

def load_occupations():
    csv = read_csv_from_s3('redshift/attrs/attrs_cbo.csv')
    df = pd.read_csv(
            csv,
            sep=';',
            header=0,
            names=['id','name_en','name_pt'],
            converters={
                "id": str
            }
        )

    occupations_family = {}
    occupations_group = {}

    for _, row in df.iterrows():
        if len(row['id']) == 1:
            occupation_group = {
                'id': row['id'],
                'name_pt': row["name_pt"],
                'name_en': row["name_en"]
            }

            redis.set('occupation_group/' + str(row['id']), pickle.dumps(occupation_group))
            occupations_group[row['id']] = occupation_group

    for _, row in df.iterrows():
        if len(row['id']) == 4:
            occupation_family = {
                'id': row['id'],
                'name_pt': row["name_pt"],
                'name_en': row["name_en"],
                'occupation_group': occupations_group[row['id'][0]],
            }

            redis.set('occupation_family/' + str(row['id']), pickle.dumps(occupation_family))
            occupations_family[row['id']] = occupation_family


    redis.set('occupation_family', pickle.dumps(occupations_family))
    redis.set('occupation_group', pickle.dumps(occupations_group))

    print "Occupations loaded."


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
    product_sections = {}
    product_chapters = {}

    for _, row in df.iterrows():
        if row['profundidade'] == 'Seção':
            product_section_id = row['id']

            product_section = {
                'id': product_section_id,
                'name_pt': row["name_pt"],
                'name_en': row["name_en"],
            }

            redis.set('product_section/' + str(product_section_id), pickle.dumps(product_section))
            product_sections[product_section_id] = product_section

        elif row['profundidade'] == 'Capítulo':
            product_chapter_id = row['id'][2:]

            product_chapter = {
                'id': product_chapter_id,
                'name_pt': row["name_pt"],
                'name_en': row["name_en"],
            }

            redis.set('product_chapter/' + str(product_chapter_id), pickle.dumps(product_chapter))
            product_chapters[product_chapter_id] = product_chapter

    for _, row in df.iterrows():
        if row['profundidade'] == 'Posição':
            product_id = row['id'][2:]
            product_section_id = row["id"][:2]
            product_chapter_id = row["id"][2:4]

            product = {
                'name_pt': row["name_pt"],
                'name_en': row["name_en"],
                'product_section': product_sections[product_section_id],
                'product_chapter': product_chapters[product_chapter_id],
            }

            products[product_id] = product
            redis.set('product/' + str(product_id), pickle.dumps(product))

    redis.set('product', pickle.dumps(products))
    redis.set('product_section', pickle.dumps(product_sections))
    redis.set('product_chapter', pickle.dumps(product_chapters))

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
            names=['mdic_name', 'mdic_id', 'ibge_id', 'uf'],
            converters={
                "ibge_id": str
            }
        )  

    states = {}

    for _, row in df.iterrows():  
        if not row['ibge_id']:
            continue

        state = {
            'id': row['ibge_id'],
            'name_pt': row["mdic_name"],
            'name_en': row["mdic_name"],
            'abbr_pt': row['uf'],
            'abbr_en': row['uf']
        }

        states[row['ibge_id']] = state
        redis.set('state/' + str(row['ibge_id']), pickle.dumps(state))

    redis.set('state', pickle.dumps(states))

    print "States loaded."

def load_regions():
    csv = read_csv_from_s3('redshift/attrs/attrs_regioes.csv')
    df = pd.read_csv(
            csv,
            sep=';',
            header=0,
            names=['id', 'name_en', 'abbr_en', 'name_pt', 'abbr_pt']
        )

    regions = {}

    for _, row in df.iterrows():
        region = {
            'id': row['id'],
            'name_en': row["name_en"],
            'abbr_en': row['abbr_en'],
            'name_pt': row["name_pt"],
            'abbr_pt': row['abbr_pt'],
        }

        regions[row['id']] = region
        redis.set('region/' + str(row['id']), pickle.dumps(region))

    redis.set('region', pickle.dumps(regions))

    print "Regions loaded."

def load_continent():
    csv = read_csv_from_s3('redshift/attrs/attrs_continente.csv')
    df = pd.read_csv(
            csv,
            sep=';',
            header=0,
            names=['id', 'country_id', 'name_en', 'name_pt']
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
                'name_en': row["name"],
                'name_pt': row["name"],
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
        names=['uf_id', 'uf_name', 'mesorregiao_id', 'mesorregiao_name', 'microrregiao_id', 'microrregiao_name', 'municipio_id', 'municipio_name', 'municipio_id_mdic'],
        converters={
            "uf_id": str,
            "mesorregiao_id": str,
            "microrregiao_id": str,
            "municipio_id": str
        }
    )

    municipalities = {}

    for _, row in df.iterrows():
        municipality = {
            'name_pt': row["municipio_name"],
            'name_en': row["municipio_name"],
            'mesoregion': {
                'id': row["mesorregiao_id"],
                'name_pt': row["mesorregiao_name"],
                'name_en': row["mesorregiao_name"],
            },
            'microregion': {
                'id': row["microrregiao_id"],
                'name_pt': row["microrregiao_name"],
                'name_en': row["microrregiao_name"],
            },
            'state': pickle.loads(redis.get('state/' + row['municipio_id'][:2])),
            'region': pickle.loads(redis.get('region/' + row['municipio_id'][0])),
        }

        municipalities[row['municipio_id']] = municipality
        redis.set('municipality/' + str(row['municipio_id']), pickle.dumps(municipality))

    redis.set('municipality', pickle.dumps(municipalities))

    print "Municipalities loaded."

def load_industries():
    csv = read_csv_from_s3('redshift/attrs/attrs_cnae.csv')
    df = pd.read_csv(
        csv,
        sep=',',
        header=0,
        names=['id','name_en','name_pt'],
        converters={
            "id": str
        }
    )

    industry_sections = {}
    industry_divisions = {}
    industry_classes = {}

    industry_classes['-1'] = {
        'name_pt': 'Não definido',
        'name_en': 'Undefined'
    }

    industry_sections['0'] = {
        'name_pt': 'Não definido',
        'name_en': 'Undefined'
    }

    for _, row in df.iterrows():
        if len(row['id']) == 1:
            industry_section = {
                'id': row['id'],
                'name_pt': row["name_pt"],
                'name_en': row["name_en"]
            }

            redis.set('industry_section/' + str(row['id']), pickle.dumps(industry_section))
            industry_sections[row['id']] = industry_section

    for _, row in df.iterrows():
        if len(row['id']) == 3:
            division_id = row['id'][1:3]

            industry_division = {
                'id': division_id,
                'name_pt': row["name_pt"],
                'name_en': row["name_en"],
                'industry_section': row["id"][0]
            }


            redis.set('industry_division/' + str(division_id), pickle.dumps(industry_division))
            industry_divisions[division_id] = industry_division

    for _, row in df.iterrows():
        if len(row['id']) == 6:
            class_id = row["id"][1:]

            industry_classe = {
                'id': class_id,
                'name_pt': row["name_pt"],
                'name_en': row["name_en"],
                'industry_section': industry_sections[row["id"][0]],
                'industry_division': industry_divisions[row["id"][1:3]]
            }

            redis.set('industry_class/' + str(class_id), pickle.dumps(industry_classe))
            industry_classes[class_id] = industry_classe

    redis.set('industry_class', pickle.dumps(industry_classes))
    redis.set('industry_division', pickle.dumps(industry_divisions))
    redis.set('industry_section', pickle.dumps(industry_sections))

    print "Industries loaded."

def load_ethnicities():
    csv = read_csv_from_s3('redshift/attrs/attrs_etnias.csv')
    df = pd.read_csv(
            csv,
            sep=';',
            header=0,
            names=['id', 'name_en', 'name_pt']
        )

    ethnicities = {}

    for _, row in df.iterrows():
        ethnicity = {
            'name_en': row["name_en"],
            'name_pt': row["name_pt"]
        }

        ethnicities[row['id']] = ethnicity
        redis.set('ethnicity/' + str(row['id']), pickle.dumps(ethnicity))

    redis.set('ethnicity', pickle.dumps(ethnicities))

    print "Ethnicities loaded."

def load_literacities():
    csv = read_csv_from_s3('redshift/attrs/attrs_escolaridade.csv')
    df = pd.read_csv(
            csv,
            sep=';',
            header=0,
            names=['id', 'name_en', 'name_pt']
        )

    literacities = {}

    for _, row in df.iterrows():
        literacy = {
            'name_en': row["name_en"],
            'name_pt': row["name_pt"]
        }

        literacities[row['id']] = literacy
        redis.set('literacy/' + str(row['id']), pickle.dumps(literacy))

    redis.set('literacy', pickle.dumps(literacities))

    print "Literacities loaded."

def load_simples():
    csv = read_csv_from_s3('redshift/attrs/attrs_simples.csv')
    df = pd.read_csv(
            csv,
            sep=';',
            header=0,
            names=['id', 'name_en', 'name_pt']
        )

    simples = {}

    for _, row in df.iterrows():
        simple = {
            'name_en': row["name_en"],
            'name_pt': row["name_pt"]
        }

        simples[row['id']] = simple
        redis.set('simple/' + str(row['id']), pickle.dumps(simple))

    redis.set('simple', pickle.dumps(simples))

    print "Simples loaded."

def load_legal_nature():
    csv = read_csv_from_s3('redshift/attrs/attrs_natureza_juridica.csv')
    df = pd.read_csv(
            csv,
            sep=';',
            header=0,
            names=['id', 'name_en', 'name_pt']
        )

    legal_natures = {}

    for _, row in df.iterrows():
        legal_nature = {
            'name_en': row["name_en"],
            'name_pt': row["name_pt"]
        }

        legal_natures[row['id']] = legal_nature
        redis.set('legal_nature/' + str(row['id']), pickle.dumps(legal_nature))

    redis.set('legal_nature', pickle.dumps(legal_natures))

    print "Legal Natures loaded."

def load_establishment_size():
    csv = read_csv_from_s3('redshift/attrs/attrs_tam_estab.csv')
    df = pd.read_csv(
            csv,
            sep=';',
            header=0,
            names=['id', 'name_en', 'name_pt']
        )

    establishment_sizes = {}

    for _, row in df.iterrows():
        establishment_size = {
            'name_en': row["name_en"],
            'name_pt': row["name_pt"]
        }

        establishment_sizes[row['id']] = establishment_size
        redis.set('establishment_size/' + str(row['id']), pickle.dumps(establishment_size))

    redis.set('establishment_size', pickle.dumps(establishment_sizes))

    print "Establishment Sizes loaded."

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

def load_universities():
    csv = read_csv_from_s3('redshift/attrs/attrs_university.csv')
    df = pd.read_csv(
            csv,
            sep=';',
            header=0,
            names=['id', 'name_pt'],
            converters={
                'id': str
            }
        )

    universities = {}

    for _, row in df.iterrows():
        university = {
            'name_en': row["name_pt"],
            'name_pt': row["name_pt"]
        }

        universities[row['id']] = university
        redis.set('university/' + str(row['id']), pickle.dumps(university))

    redis.set('university', pickle.dumps(universities))

    print "Universities loaded."

def load_sc_course():
    csv = read_csv_from_s3('redshift/attrs/attrs_sc_course.csv')
    df = pd.read_csv(
        csv,
        sep=';',
        header=0,
        names=['id', 'name_en', 'name_pt'],
        converters={
            "id": str
        }
    )

    sc_courses = {}
    sc_courses_field = {}

    for _, row in df.iterrows():

        if len(row['id']) == 2:
            sc_course_field = {
                'name_pt': row["name_pt"],
                'name_en': row["name_en"]
            }

            redis.set('sc_course_field/' + str(row['id']), pickle.dumps(sc_course_field))
            sc_courses_field[row['id']] = sc_course_field

        elif len(row['id']) == 5:
            sc_course = {
                'name_pt': row["name_pt"],
                'name_en': row["name_en"]
            }

            redis.set('sc_course/' + str(row['id']), pickle.dumps(sc_course))
            sc_courses[row['id']] = sc_course

    redis.set('sc_course', pickle.dumps(sc_courses))
    redis.set('sc_course_field', pickle.dumps(sc_courses_field))

    print "SC Courses loaded."

def load_hedu_course():
    csv = read_csv_from_s3('redshift/attrs/attrs_hedu_course.csv')
    df = pd.read_csv(
        csv,
        sep=';',
        header=0,
        names=['id', 'name_en', 'name_pt'],
        converters={
            "id": str
        }
    )

    hedu_courses = {}
    hedu_courses_field = {}

    for _, row in df.iterrows():

        if len(row['id']) == 2:
            hedu_course_field = {
                'name_pt': row["name_pt"],
                'name_en': row["name_en"]
            }

            redis.set('hedu_course_field/' + str(row['id']), pickle.dumps(hedu_course_field))
            hedu_courses_field[row['id']] = hedu_course_field

        elif len(row['id']) == 6:
            hedu_course = {
                'name_pt': row["name_pt"],
                'name_en': row["name_en"]
            }

            redis.set('hedu_course/' + str(row['id']), pickle.dumps(hedu_course))
            hedu_courses[row['id']] = hedu_course

    redis.set('hedu_course', pickle.dumps(hedu_courses))
    redis.set('hedu_course_field', pickle.dumps(hedu_courses_field))

    print "HEDU Courses loaded."


class LoadMetadataCommand(Command):
    
    """
    Load the Redis database
    """

    def run(self):
        load_continent()
        load_countries()
        load_regions()
        load_states()
        load_municipalities()
        load_ports()
        load_products()
        load_territories()
        load_economic_blocks()
        load_genders()
        load_industries()
        load_ethnicities()
        load_literacities()
        load_simples()
        load_legal_nature()
        load_establishment_size()
        load_occupations()
        load_universities()
        load_sc_course()
        load_hedu_course()
