from test_base import BaseTestCase

class TestCountry(BaseTestCase):

    def test_country_path(self):
        response = self.client.get('/metadata/country')
        self.assert_200(response)

    def test_country_plural_path(self):
        response = self.client.get('/metadata/countries')
        self.assert_200(response)

    def test_country_fields(self):
        response = self.client.get('/metadata/country')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        
    def test_country_item(self):
        response = self.client.get('/metadata/country/023')

        country = {
            'name_en': 'Germany', 
            'name_pt': 'Alemanha'
        }

        self.assertEqual(response.json, country)