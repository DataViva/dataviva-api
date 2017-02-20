from test_base import BaseTestCase

class TestGender(BaseTestCase):

    def test_gender_path(self):
        response = self.client.get('/metadata/gender')
        self.assert_200(response)

    def test_gender_plural_path(self):
        response = self.client.get('/metadata/genders')
        self.assert_200(response)

    def test_gender_fields(self):
        response = self.client.get('/metadata/gender')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        
    def test_gender_item(self):
        response = self.client.get('/metadata/gender/0')

        gender = {
            'name_en': 'Female', 
            'name_pt': 'Mulher'
        }

        self.assertEqual(response.json, gender)