from test_base import BaseTestCase
import unittest
import flask_testing


class TestScApiTests(BaseTestCase):

    def test_should_respond_ok_to_sc_path(self):
        response = self.client.get('/sc/year/')
        self.assert_200(response)

    def test_should_check_if_all_years_are_loaded(self):
        response = self.client.get('/sc/year/?order=year')
        first_year = 2008
        last_year = 2015
        
        data = response.json['data']
        year_index = response.json['headers'].index('year')

        self.assertEqual(data[0][year_index], first_year)
        self.assertEqual(data[-1][year_index], last_year)

        year = first_year
        for item in data:
            self.assertEqual(item[year_index], year)
            year += 1

    def test_should_check_default_headers(self):
        response = self.client.get('/sc/year/')
        headers = response.json['headers']

        for header in ['year', 'average_age']:
            self.assertIn(header, headers)

    def test_should_check_average_age_in_2008(self):
        response = self.client.get('/sc/year/?year=2008')
        
        data = response.json['data']
        value_index = response.json['headers'].index('average_age')

        self.assertEqual(data[0][value_index], 12)
