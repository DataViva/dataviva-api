from test_base import BaseTestCase

class TestEconomicBlock(BaseTestCase):

    def test_economic_block_path(self):
        response = self.client.get('/metadata/economic_block')
        self.assert_200(response)

    def test_economic_block_plural_path(self):
        response = self.client.get('/metadata/economic_blocks')
        self.assert_200(response)

    def test_economic_block_fields(self):
        response = self.client.get('/metadata/economic_block')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('countries'))
        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))

    def test_economic_block_item(self):
        response = self.client.get('/metadata/economic_block/10')

        economic_block = {
            'countries': ["063", "586", "845"],
            'name_en': 'MERCADO COMUM DO SUL - MERCOSUL', 
            'name_pt': 'MERCADO COMUM DO SUL - MERCOSUL'
        }

        self.assertEqual(response.json, economic_block)