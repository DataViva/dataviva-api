from test_base import BaseTestCase

class TestState(BaseTestCase):

    def test_state_path(self):
        response = self.client.get('/metadata/state')
        self.assert_200(response)

    def test_state_plural_path(self):
        response = self.client.get('/metadata/states')
        self.assert_200(response)

    def test_state_fields(self):
        response = self.client.get('/metadata/state')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        self.assertTrue(item.has_key('abbr_en'))
        self.assertTrue(item.has_key('abbr_pt'))
        self.assertTrue(item.has_key('id'))
        
    def test_state_item(self):
        response = self.client.get('/metadata/state/12')

        state = {
            'name_en': 'Acre', 
            'name_pt': 'Acre',
            'abbr_en': 'AC', 
            'abbr_pt': 'AC',
            'id': '12'
        }

        self.assertEqual(response.json, state)