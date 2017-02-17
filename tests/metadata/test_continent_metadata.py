from test_base import BaseTestCase

class TestContinent(BaseTestCase):

    def test_continent_path(self):
        response = self.client.get('/metadata/continent')
        self.assert_200(response)

    def test_continent_plural_path(self):
        response = self.client.get('/metadata/continents')
        self.assert_200(response)

    def test_continent_fields(self):
        response = self.client.get('/metadata/continent')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        self.assertTrue(item.has_key('countries'))
        
    def test_continent_item(self):
        response = self.client.get('/metadata/continent/eu')

        continent = {
            'name_en': 'Europe', 
            'name_pt': 'Europa',
            'countries': [111, 150, 17, 195, 23, 232, 245, 246, 247, 251, 259, 271, 275, 293, 301, 355, 359, 37, 375, 379, 386, 388, 427, 440, 442, 445, 449, 452, 467, 494, 495, 498, 538, 573, 603, 607, 628, 670, 697, 72, 737, 764, 767, 791, 831, 848, 85, 87, 98, 367]
        }

        self.assertEqual(response.json, continent)