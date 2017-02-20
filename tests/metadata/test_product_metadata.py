from test_base import BaseTestCase

class TestProduct(BaseTestCase):

    def test_product_path(self):
        response = self.client.get('/metadata/product')
        self.assert_200(response)

    def test_product_plural_path(self):
        response = self.client.get('/metadata/products')
        self.assert_200(response)

    def test_product_fields(self):
        response = self.client.get('/metadata/product')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        self.assertTrue(item.has_key('product_chapter'))
        self.assertTrue(item.has_key('product_section'))

        product_chapter = item['product_chapter']
        self.assertTrue(product_chapter.has_key('id'))
        self.assertTrue(product_chapter.has_key('name_en'))
        self.assertTrue(product_chapter.has_key('name_pt'))

        product_section = item['product_section']
        self.assertTrue(product_section.has_key('id'))
        self.assertTrue(product_section.has_key('name_en'))
        self.assertTrue(product_section.has_key('name_pt'))
        
    def test_product_item(self):
        response = self.client.get('/metadata/product/0101')

        product = {
            'name_en': 'Horses', 
            'name_pt': 'Cavalos',
            'product_chapter': {
                'id': '01',
                'name_en': 'Live Animals',
                'name_pt': 'Animais vivos'
            },
            'product_section': {
                'id': '01',
                'name_en': 'Animal Products',
                'name_pt': 'Produtos de origem animal'
            }
        }

        self.assertEqual(response.json, product)