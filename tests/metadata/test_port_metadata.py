from test_base import BaseTestCase

class TestPort(BaseTestCase):

    def test_port_path(self):
        response = self.client.get('/metadata/port')
        self.assert_200(response)

    def test_port_plural_path(self):
        response = self.client.get('/metadata/ports')
        self.assert_200(response)

    def test_port_fields(self):
        response = self.client.get('/metadata/port')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        
    def test_port_item(self):
        response = self.client.get('/metadata/port/1102')

        port = {
            'name_en': 'Abuna - RO', 
            'name_pt': 'Abuna - RO'
        }

        self.assertEqual(response.json, port)