from test_base import BaseTestCase

class TestRegion(BaseTestCase):

    def test_region_path(self):
        response = self.client.get('/metadata/region')
        self.assert_200(response)

    def test_region_plural_path(self):
        response = self.client.get('/metadata/regions')
        self.assert_200(response)

    def test_region_fields(self):
        response = self.client.get('/metadata/region')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        self.assertTrue(item.has_key('abbr_en'))
        self.assertTrue(item.has_key('abbr_pt'))
        self.assertTrue(item.has_key('id'))
        
    def test_region_item(self):
        response = self.client.get('/metadata/region/1')

        region = {
            'name_en': 'North', 
            'name_pt': 'Norte',
            'abbr_en': 'N', 
            'abbr_pt': 'N',
            'id': 1
        }

        self.assertEqual(response.json, region)