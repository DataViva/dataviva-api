from test_base import BaseTestCase

class TestCnesBedApiTests(BaseTestCase):

    def test_should_respond_ok_to_cnes_bed_path(self):
        response = self.client.get('/cnes_bed/year/')
        self.assert_200(response)

    def test_should_check_if_all_years_are_loaded(self):
        response = self.client.get('/cnes_bed/year/?order=year')
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
        response = self.client.get('/cnes_bed/year/')
        headers = response.json['headers']
 
        for header in ['year', 'beds']:
            self.assertIn(header, headers)

    def test_should_check_value_in_2008(self):
        response = self.client.get('/cnes_bed/year/?year=2008')
        
        data = response.json['data']
        value_index = response.json['headers'].index('beds')

        self.assertEqual(data[0][value_index], 46926)
