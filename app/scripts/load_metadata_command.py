# -*- coding: utf-8 -*-
from flask_script import Command
import pickle
import pandas as pd
from app import redis
import json
from s3 import read_csv, save_json


def load_ports():
    csv = read_csv('redshift/attrs/attrs_porto.csv')
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

    save_json('attrs_port.json', json.dumps(ports, ensure_ascii=False))
    redis.set('port', pickle.dumps(ports))

    print "Ports loaded."

def load_countries():
    csv = read_csv('redshift/attrs/attrs_continente.csv')
    df_continents = pd.read_csv(
        csv,
        sep=';',
        header=0,
        names=['id', 'country_id', 'name_en', 'name_pt'],
        converters={
            "country_id": lambda x: '%03d' % int(x)
        }
    )

    continents = {}

    for _, row in df_continents.iterrows():
        continents[row['country_id']] =  {
            'id': row["id"],
            'name_en': row["name_en"],
            'name_pt': row["name_pt"],
        }

    csv = read_csv('redshift/attrs/attrs_wld.csv')
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
            'id': row["id"],
            'name_pt': row["name_pt"],
            'name_en': row["name_en"],
            'continent': continents.get(row["id"], {})
        }

        countries[row['id']] = country
        redis.set('country/' + str(row['id']), pickle.dumps(country))

    save_json('attrs_country.json', json.dumps(countries, ensure_ascii=False))
    redis.set('country', pickle.dumps(countries))

    print "Countries loaded."

class LoadOccupations(Command):

    """
    Load Occupations metadata
    """

    def run(self):
        csv = read_csv('redshift/attrs/attrs_cbo.csv')
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

        save_json('attrs_occupation_family.json', json.dumps(occupations_family, ensure_ascii=False))

        save_json('attrs_ocupation_group.json', json.dumps(ocupations_group, ensure_ascii=False))

        print "Occupations loaded."

class LoadProducts(Command):

    """
    Load Products metadata
    """

    def run(self):
        csv = read_csv('redshift/attrs/attrs_hs.csv')
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

        save_json('attrs_product.json', json.dumps(products, ensure_ascii=False))

        save_json('attrs_product_section.json', json.dumps(product_sections, ensure_ascii=False))

        save_json('attrs_product_chapter.json', json.dumps(product_chapters, ensure_ascii=False))

        print "Products loaded."

class LoadStates(Command):

    """
    Load States metadata
    """

    def self(run):
        """
        Rows without ibge_id aren't saving
        """
        csv = read_csv('redshift/attrs/attrs_uf_ibge_mdic.csv')
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

        save_json('attrs_state.json', json.dumps(states, ensure_ascii=False))

        print "States loaded."

class LoadRegions(Command):

    """
    Load Regions metadata
    """

    def run(self):
        csv = read_csv('redshift/attrs/attrs_regioes.csv')
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

        save_json('attrs_region.json', json.dumps(regions, ensure_ascii=False))

        print "Regions loaded."

class LoadContinents(Command):

    """
    Load Continents metadata
    """

    def run(self):
        csv = read_csv('redshift/attrs/attrs_continente.csv')
        df = pd.read_csv(
                csv,
                sep=';',
                header=0,
                names=['id', 'country_id', 'name_en', 'name_pt'],
                converters={
                    "country_id": lambda x: '%03d' % int(x)
                }
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

        save_json('attrs_continent.json', json.dumps(continents, ensure_ascii=False))

        print "Continents loaded."

class LoadTerritories(Command):

    """
    Load Territories metadata
    """

    def run(self):
        csv = read_csv('redshift/attrs/attrs_territorios_de_desenvolvimento.csv')
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

        save_json('attrs_territory.json', json.dumps(territories, ensure_ascii=False))

        print "Territories loaded."    

class LoadEconomicBlocks(Command):

    """
    Load EconomicBlocks metadata
    """

    def run(self):
        csv = read_csv('redshift/attrs/attrs_bloco_economico.csv')
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

        save_json('attrs_economic_block.json', json.dumps(economic_blocks, ensure_ascii=False))

        print "Economic Blocks loaded."

class LoadMunicipalities(Command):

    """
    Load Municipalities metadata
    """

    def run(self):
        csv = read_csv('redshift/attrs/attrs_municipios.csv')
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
        microregions = {}
        mesoregions = {}

        for _, row in df.iterrows():
            municipality = {
                'id': row['municipio_id'],
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
            microregions[row['microrregiao_id']] = municipality['microregion']
            mesoregions[row['mesorregiao_id']] = municipality['mesoregion']

            redis.set('municipality/' + str(row['municipio_id']), pickle.dumps(municipality))
            redis.set('microregion/' + str(row['microrregiao_id']), pickle.dumps(municipality['microregion']))
            redis.set('mesoregion/' + str(row['mesorregiao_id']), pickle.dumps(municipality['mesoregion']))

        save_json('attrs_municipality.json', json.dumps(municipalities, ensure_ascii=False))

        save_json('attrs_microregion.json', json.dumps(microregions, ensure_ascii=False))

        save_json('attrs_mesoregion.json', json.dumps(mesoregions, ensure_ascii=False))

        print "Municipalities, microregions and mesoregions loaded."

class LoadIndustries(Command):
    
    """
    Load Industries metadata
    """

    def run(self):
        csv = read_csv('redshift/attrs/attrs_cnae.csv')
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

        save_json('attrs_industry_class.json', json.dumps(industry_classes, ensure_ascii=False))

        save_json('attrs_industry_division.json', json.dumps(industry_divisions, ensure_ascii=False))

        save_json('attrs_industry_section.json', json.dumps(industry_sections, ensure_ascii=False))

    print "Industries loaded."

class LoadHeduCourse(Command):
    
    """
    Load HEDU Course metadata
    """

    def run(self):
        csv = read_csv('redshift/attrs/attrs_hedu_course.csv')
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
                    'id': row['id'],
                    'name_pt': row["name_pt"],
                    'name_en': row["name_en"],
                }

                redis.set('hedu_course_field/' + str(row['id']), pickle.dumps(hedu_course_field))
                hedu_courses_field[row['id']] = hedu_course_field

        for _, row in df.iterrows():
            if len(row['id']) == 6:
                hedu_course = {
                    'id': row['id'],
                    'name_pt': row["name_pt"],
                    'name_en': row["name_en"],
                    'hedu_course_field': hedu_courses_field[row['id'][:2]]
                }

                redis.set('hedu_course/' + str(row['id']), pickle.dumps(hedu_course))
                hedu_courses[row['id']] = hedu_course

        save_json('attrs_hedu_course.json', json.dumps(hedu_courses, ensure_ascii=False))

        save_json('attrs_hedu_course_field.json', json.dumps(hedu_courses_field, ensure_ascii=False))

        print "HEDU Courses loaded."

class LoadEstablishments(Command):

    """
    Load Establishments metadata
    """

    def run(self):
        csv = read_csv('attrs/cnes_final.csv')
        df = pd.read_csv(
                csv,
                sep=';',
                header=0,
                names=['id', 'name_en', 'name_pt'],
                converters={
                    'id': str,
                }
            )

        for _, row in df.iterrows():

            establishment = {
                'id': row['id'],
                'name_pt': row["name_pt"],
                'name_en': row["name_en"],
            }

            redis.set('establishment/' + str(row['id']), pickle.dumps(establishment))

        print "Establishment loaded."

def load_attrs(attrs):
    for attr in attrs:
        print 'Loading %s ...' % attr['name'],
        csv = read_csv('redshift/attrs/%s' % attr['csv_filename'])
        df = pd.read_csv(
                csv,
                sep=';',
                header=0,
                converters={
                    'id': str
                },
                engine='c'
            )

        items = {}

        for _, row in df.iterrows():
            item = {
                'id': row["id"],
                'name_pt': row["name_pt"],
                'name_en': row["name_en"],
            }

            items[row['id']] = item
            redis.set(attr['name'] + '/' + str(row['id']), pickle.dumps(item))

        redis.set(attr['name'], pickle.dumps(items))

        print " loaded."

class LoadInflections(Command):

    """
    Load Inflections metadata
    """

    def run(self):
        csv = read_csv('redshift/attrs/attrs_infleccoes.csv')
        df = pd.read_csv(
                csv,
                sep=';',
                header=0,
                names=['id','name_en','name_pt','gender','plural']
            )

        inflections = {}

        for _, row in df.iterrows():
            inflection = {
                'id': row['id'],
                'name_en': row['name_en'],
                'name_pt': row['name_pt'],
                'gender': row['gender'],
                'plural': row['plural']
            }
            inflections[row['id']] = inflection
            redis.set('inflection/' + str(row['id']), pickle.dumps(inflection))

        save_json('attrs_inflection.json', json.dumps(inflections, ensure_ascii=False))

        print "Inflections loaded."


class LoadMetadataCommand(Command):
    
    """
    Load the Redis database
    """

    def run(self):
        load_countries()
        load_ports()
        load_attrs([
            #hedu
            {'name': 'shift', 'csv_filename': 'attrs_shift.csv'},
            {'name': 'funding_type', 'csv_filename': 'attrs_funding_type.csv'},
            {'name': 'school_type', 'csv_filename': 'attrs_school_type.csv'},
            #rais and scholar
            {'name': 'ethnicity', 'csv_filename': 'attrs_etnias.csv'},
            #rais
            {'name': 'gender', 'csv_filename': 'attrs_generos.csv'},
            {'name': 'establishment_size', 'csv_filename': 'attrs_tam_estab.csv'},
            {'name': 'literacy', 'csv_filename': 'attrs_escolaridade.csv'},
            {'name': 'simple', 'csv_filename': 'attrs_simples.csv'},
            {'name': 'legal_nature', 'csv_filename': 'attrs_natureza_juridica.csv'},
            #sc
            {'name': 'university', 'csv_filename': 'attrs_university.csv'},
            {'name': 'sc_school', 'csv_filename': 'attrs_school.csv'},
            {'name': 'administrative_dependency', 'csv_filename': 'attrs_administrative_dependency.csv'},
            #cnes bed
            {'name': 'bed_type', 'csv_filename': 'attrs_tipos_leito.csv'},
            {'name': 'bed_type_per_specialty', 'csv_filename': 'attrs_cnes_codleito.csv'},
            #cnes
            {'name': 'cnes_pf_pj', 'csv_filename': 'attrs_cnes_pf_pj.csv'},
            # cnes establishment
            {'name': 'establishment_type', 'csv_filename': 'attrs_cnes_establishment_type.csv'},
            {'name': 'unit_type', 'csv_filename': 'attrs_cnes_tp_unid.csv'},
            {'name': 'hierarchy_level', 'csv_filename': 'attrs_cnes_niv_hier_2.csv'},
            {'name': 'tax_withholding', 'csv_filename': 'attrs_cnes_retencao_2.csv'},
            {'name': 'administrative_sphere', 'csv_filename': 'attrs_cnes_esfera.csv'},
            {'name': 'selective_waste_collection', 'csv_filename': 'attrs_cnes_coletres.csv'},
            {'name': 'hospital_care', 'csv_filename': 'attrs_cnes_atendhos.csv'},
            {'name': 'neonatal_unit_facility', 'csv_filename': 'attrs_cnes_centrneo.csv'},
            {'name': 'niv_dep_1', 'csv_filename': 'attrs_cnes_niv_dep.csv'},
            {'name': 'ambulatory_care_facility', 'csv_filename': 'attrs_cnes_atendamb.csv'},
            {'name': 'emergency_facility', 'csv_filename': 'attrs_cnes_urgemerg.csv'},
            {'name': 'hospital_attention', 'csv_filename': 'attrs_cnes_nivate_h.csv'},
            {'name': 'ambulatory_attention', 'csv_filename': 'attrs_cnes_nivate_a.csv'},
            {'name': 'provider_type', 'csv_filename': 'attrs_cnes_tp_prest.csv'},
            {'name': 'sus_bond', 'csv_filename': 'attrs_sus_bond.csv'},
            {'name': 'cnes_altacomplexidade_hosp', 'csv_filename': 'attrs_cnes_altacomplexidade_hosp.csv'},
            {'name': 'cnes_mediacomplexidade_hosp', 'csv_filename': 'attrs_cnes_mediacomplexidade_hosp.csv'},
            {'name': 'cnes_internacao_hosp', 'csv_filename': 'attrs_cnes_internacao_hosp.csv'},
            {'name': 'cnes_altacomplexidade_amb', 'csv_filename': 'attrs_cnes_altacomplexidade_amb.csv'},
            {'name': 'cnes_mediacomplexidade_amb', 'csv_filename': 'attrs_cnes_mediacomplexidade_amb.csv'},
            {'name': 'cnes_atencaobasica_amb', 'csv_filename': 'attrs_cnes_atencaobasica_amb.csv'},
            {'name': 'cnes_tipodeurgencia', 'csv_filename': 'attrs_cnes_tipodeurgencia.csv'},
            {'name': 'cnes_tipodesadt', 'csv_filename': 'attrs_cnes_tipodesadt.csv'},
            {'name': 'cnes_tipodeambulatorio', 'csv_filename': 'attrs_cnes_tipodeambulatorio.csv'},
            {'name': 'cnes_tipointernacao', 'csv_filename': 'attrs_cnes_tipointernacao.csv'},
            {'name': 'obstetrical_center_facility', 'csv_filename': 'attrs_cnes_centrobs.csv'},
            {'name': 'surgery_center_facility', 'csv_filename': 'attrs_cnes_centrcir.csv'},
            {'name': 'health_region', 'csv_filename': 'attrs_cnes_regsaude.csv'},
            #cnes equipment
            {'name': 'sus_availability_indicator', 'csv_filename': 'attrs_cnes_ind_sus.csv'},
            {'name': 'equipment_code', 'csv_filename': 'attrs_cnes_codequip.csv'},
            {'name': 'equipment_type', 'csv_filename': 'attrs_cnes_tipequip.csv'},
            # cnes professionals
            {'name': 'professional_link', 'csv_filename': 'attrs_cnes_vinculac.csv'},
            {'name': 'sus_healthcare_professional', 'csv_filename': 'attrs_cnes_prof_sus.csv'},
            #comum
        ])
