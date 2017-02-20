from test_base import BaseTestCase

class TestEthnicity(BaseTestCase):

    def test_ethnicity_path(self):
        response = self.client.get('/metadata/ethnicity')
        self.assert_200(response)

    def test_ethnicity_plural_path(self):
        response = self.client.get('/metadata/ethnicities')
        self.assert_200(response)

    def test_ethnicity_fields(self):
        response = self.client.get('/metadata/ethnicity')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))

        
    def test_ethnicity_item(self):
        response = self.client.get('/metadata/ethnicity/2')

        ethnicity = {
          'name_en': 'White', 
          'name_pt': 'Branca'
        }

        self.assertEqual(response.json, ethnicity)
        