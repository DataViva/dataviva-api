from test_base import BaseTestCase

class TestSimple(BaseTestCase):

    def test_simple_path(self):
        response = self.client.get('/metadata/simple')
        self.assert_200(response)

    def test_simple_plural_path(self):
        response = self.client.get('/metadata/simples')
        self.assert_200(response)

    def test_simple_fields(self):
        response = self.client.get('/metadata/simple')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        
    def test_simple_item(self):
        response = self.client.get('/metadata/simple/1')

        simple = {
            'name_en': 'Yes', 
            'name_pt': 'Sim'
        }

        self.assertEqual(response.json, simple)
        