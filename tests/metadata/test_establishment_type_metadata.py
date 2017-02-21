from test_base import BaseTestCase

class TestCnesEstablishmentTypes(BaseTestCase):

    def test_establishment_type_path(self):
        response = self.client.get('/metadata/establishment_type')
        self.assert_200(response)

    def test_establishment_type_plural_path(self):
        response = self.client.get('/metadata/establishment_types')
        self.assert_200(response)

    def test_establishment_type_fields(self):
        response = self.client.get('/metadata/establishment_type')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        
    def test_establishment_type_item(self):
        response = self.client.get('/metadata/establishment_type/60')

        establishment_type = {
            'name_en': 'Cooperative', 
            'name_pt': 'Cooperativa'
        }

        self.assertEqual(response.json, establishment_type)
