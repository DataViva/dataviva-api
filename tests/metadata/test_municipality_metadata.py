from test_base import BaseTestCase

class TestMunicipality(BaseTestCase):

    def test_municipality_path(self):
        response = self.client.get('/metadata/municipality')
        self.assert_200(response)

    def test_municipality_plural_path(self):
        response = self.client.get('/metadata/municipalities')
        self.assert_200(response)

    def test_municipality_fields(self):
        response = self.client.get('/metadata/municipality')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        self.assertTrue(item.has_key('mesoregion'))
        self.assertTrue(item.has_key('microregion'))
        self.assertTrue(item.has_key('region'))
        self.assertTrue(item.has_key('state'))

        mesoregion = item['mesoregion']
        self.assertTrue(mesoregion.has_key('id'))
        self.assertTrue(mesoregion.has_key('name_en'))
        self.assertTrue(mesoregion.has_key('name_pt'))

        microregion = item['microregion']
        self.assertTrue(microregion.has_key('id'))
        self.assertTrue(microregion.has_key('name_en'))
        self.assertTrue(microregion.has_key('name_pt'))

        region = item['region']
        self.assertTrue(region.has_key('abbr_en'))
        self.assertTrue(region.has_key('abbr_pt'))
        self.assertTrue(region.has_key('id'))
        self.assertTrue(region.has_key('name_en'))
        self.assertTrue(region.has_key('name_pt'))

        state = item['state']
        self.assertTrue(state.has_key('abbr_en'))
        self.assertTrue(state.has_key('abbr_pt'))
        self.assertTrue(state.has_key('id'))
        self.assertTrue(state.has_key('name_en'))
        self.assertTrue(state.has_key('name_pt'))
        
    def test_municipality_item(self):
        response = self.client.get('/metadata/municipality/1300300')

        municipality = {
            'name_en': 'Autazes', 
            'name_pt': 'Autazes',
            'mesoregion': {
                'id': '1303',
                'name_en': 'Centro Amazonense',
                'name_pt': 'Centro Amazonense'
            },
            'microregion': {
                'id': '13007',
                'name_en': 'Manaus',
                'name_pt': 'Manaus'
            },
            'region': {
                'abbr_en': 'N',
                'abbr_pt': 'N',
                'id': 1,
                'name_en': 'North',
                'name_pt': 'Norte'
            },
            'state': {
                'abbr_en': 'AM',
                'abbr_pt': 'AM',
                'id': '13',
                'name_en': 'Amazonas',
                'name_pt': 'Amazonas'
            }
        }

        self.assertEqual(response.json, municipality)