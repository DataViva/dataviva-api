from test_base import BaseTestCase

class TestTerritory(BaseTestCase):

    def test_territory_path(self):
        response = self.client.get('/metadata/territory')
        self.assert_200(response)

    def test_territory_plural_path(self):
        response = self.client.get('/metadata/territories')
        self.assert_200(response)

    def test_territory_fields(self):
        response = self.client.get('/metadata/territory')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('microterritory'))
        self.assertTrue(item.has_key('municipy_id'))
        self.assertTrue(item.has_key('territory'))
        
    def test_territory_item(self):
        response = self.client.get('/metadata/territory/1101435')

        territory = {
            'microterritory': 'Nova Lima', 
            'municipy_id': '1101435',
            'territory': 'Metropolitano'
        }

        self.assertEqual(response.json, territory)