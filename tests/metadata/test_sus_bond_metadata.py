from test_base import BaseTestCase

class TestSusBond(BaseTestCase):

    def test_sus_bond_path(self):
        response = self.client.get('/metadata/sus_bond')
        self.assert_200(response)

    def test_sus_bond_plural_path(self):
        response = self.client.get('/metadata/sus_bonds')
        self.assert_200(response)

    def test_sus_bond_fields(self):
        response = self.client.get('/metadata/sus_bond')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        
    def test_sus_bond_item(self):
        response = self.client.get('/metadata/sus_bond/1')

        sus_bond = {
            'name_en': 'Yes', 
            'name_pt': 'Sim'
        }

        self.assertEqual(response.json, sus_bond)
