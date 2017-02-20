from test_base import BaseTestCase

class TestEstablishmentSize(BaseTestCase):

    def test_establishment_size_path(self):
        response = self.client.get('/metadata/establishment_size')
        self.assert_200(response)

    def test_establishment_size_plural_path(self):
        response = self.client.get('/metadata/establishment_sizes')
        self.assert_200(response)

    def test_establishment_size_fields(self):
        response = self.client.get('/metadata/establishment_size')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))

        
    def test_establishment_size_item(self):
        response = self.client.get('/metadata/establishment_size/-1')

        establishment_size = {
          'name_en': 'Ignored', 
          'name_pt': 'Ignorado'
        }

        self.assertEqual(response.json, establishment_size)
        