from test_base import BaseTestCase

class TestLiteracy(BaseTestCase):

    def test_literacy_path(self):
        response = self.client.get('/metadata/literacy')
        self.assert_200(response)

    def test_literacy_plural_path(self):
        response = self.client.get('/metadata/literacies')
        self.assert_200(response)

    def test_literacy_fields(self):
        response = self.client.get('/metadata/literacy')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))

        
    def test_literacy_item(self):
        response = self.client.get('/metadata/literacy/1')

        literacy = {
          'name_en': 'Illiterate', 
          'name_pt': 'Analfabeto'
        }

        self.assertEqual(response.json, literacy)
        