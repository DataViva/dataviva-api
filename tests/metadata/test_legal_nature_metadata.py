from test_base import BaseTestCase

class TestLegalNature(BaseTestCase):

    def test_legal_nature_path(self):
        response = self.client.get('/metadata/legal_nature')
        self.assert_200(response)

    def test_legal_nature_plural_path(self):
        response = self.client.get('/metadata/legal_natures')
        self.assert_200(response)

    def test_legal_nature_fields(self):
        response = self.client.get('/metadata/legal_nature')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        
    def test_legal_nature_item(self):
        response = self.client.get('/metadata/legal_nature/4')

        legal_nature = {
            'name_en': 'Private', 
            'name_pt': 'Privada'
        }

        self.assertEqual(response.json, legal_nature)
        