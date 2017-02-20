from test_base import BaseTestCase

class Testuniversity(BaseTestCase):

    def test_university_path(self):
        response = self.client.get('/metadata/university')
        self.assert_200(response)

    def test_university_plural_path(self):
        response = self.client.get('/metadata/universities')
        self.assert_200(response)

    def test_university_fields(self):
        response = self.client.get('/metadata/university')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        
    def test_university_item(self):
        response = self.client.get('/metadata/university/00003')

        university = {
            'name_en': 'Universidade Federal De Sergipe', 
            'name_pt': 'Universidade Federal De Sergipe'
        }

        self.assertEqual(response.json, university)
        