from test_base import BaseTestCase

class TestOccupationFamily(BaseTestCase):

    def test_occupation_family_path(self):
        response = self.client.get('/metadata/occupation_family')
        self.assert_200(response)

    def test_occupation_family_plural_path(self):
        response = self.client.get('/metadata/occupation_families')
        self.assert_200(response)

    def test_occupation_family_fields(self):
        response = self.client.get('/metadata/occupation_family')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('id'))
        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        self.assertTrue(item.has_key('occupation_group'))

        occupation_group = item['occupation_group']
        self.assertTrue(occupation_group.has_key('id'))
        self.assertTrue(occupation_group.has_key('name_en'))
        self.assertTrue(occupation_group.has_key('name_pt'))
        
    def test_occupation_family_item(self):
        response = self.client.get('/metadata/occupation_family/1142')

        occupation_family = {
          'id': '1142', 
          'name_en': 'Social Economic Workers', 
          'name_pt': 'Dirigentes de Entidades Patronais e Profissionais', 
          'occupation_group': {
            'id': '1', 
            'name_en': 'Public Sector Officials and Business Managers', 
            'name_pt': 'Dirigentes'
          }
        }

        self.assertEqual(response.json, occupation_family)
        