from test_base import BaseTestCase


class SecexApiTests(BaseTestCase):

    def test_should_respond_ok_to_secex_path(self):
        response = self.client.get('/secex/year/')
        self.assert_200(response)

    def test_should_check_if_all_years_are_loaded(self):
        response = self.client.get('/secex/year/?order=year')
        first_year = 1997
        last_year = 2016
        
        data = response.json['data']
        year_index = response.json['headers'].index('year')

        self.assertEqual(data[0][year_index], first_year)
        self.assertEqual(data[-1][year_index], last_year)

        year = first_year
        for item in data:
            self.assertEqual(item[year_index], year)
            year += 1

    def test_should_check_default_headers(self):
        response = self.client.get('/secex/year/')
        headers = response.json['headers']

        for header in ['kg', 'value', 'year']:
            self.assertIn(header, headers)

    def test_should_check_value_exported_in_1997(self):
        response = self.client.get('/secex/year/?year=1997&type=export')
        
        data = response.json['data']
        value_index = response.json['headers'].index('value')

        self.assertEqual(data[0][value_index], 52982725829)
