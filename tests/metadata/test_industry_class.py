# -*- coding: utf-8 -*-

from test_base import BaseTestCase
import json

class TestIndustryClass(BaseTestCase):

    def test_industry_class_path(self):
        response = self.client.get('/metadata/industry_class')
        self.assert_200(response)

    def test_industry_class_plural_path(self):
        response = self.client.get('/metadata/industry_classes')
        self.assert_200(response)

    def test_industry_class_fields(self):
        response = self.client.get('/metadata/industry_class')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('id'))
        self.assertTrue(item.has_key('industry_division'))
        self.assertTrue(item.has_key('industry_section'))
        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))

        industry_division = item['industry_division']
        self.assertTrue(industry_division.has_key('id'))
        self.assertTrue(industry_division.has_key('industry_section'))
        self.assertTrue(industry_division.has_key('name_en'))
        self.assertTrue(industry_division.has_key('name_pt'))

        industry_section = item['industry_section']
        self.assertTrue(industry_section.has_key('id'))
        self.assertTrue(industry_section.has_key('name_en'))
        self.assertTrue(industry_section.has_key('name_pt'))

    def test_industry_class_item(self):
        self.maxDiff = None
        response = self.client.get('/metadata/industry_class/01113')

        industry_class = {
            'id': '01113',
            'industry_division': {
                'id': '01', 
                'industry_section': 'x',
                'name_en': 'Classified',
                'name_pt': 'Confidential'
            }, 
            'industry_section': {
                'id': 'a', 
                'name_en': 'Agriculture and Animal Farming', 
                'name_pt': u'Agropecuária'
            },
            'name_en': 'Cereal grains growing',
            'name_pt': 'Cultivo de cereais'
        }

        self.assertEqual(response.json, industry_class)
