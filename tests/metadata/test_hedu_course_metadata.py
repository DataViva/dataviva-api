from test_base import BaseTestCase

class TestHeduCourse(BaseTestCase):

    def test_hedu_course_path(self):
        response = self.client.get('/metadata/hedu_course')
        self.assert_200(response)

    def test_hedu_course_plural_path(self):
        response = self.client.get('/metadata/hedu_courses')
        self.assert_200(response)

    def test_hedu_course_fields(self):
        response = self.client.get('/metadata/hedu_course')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        
    def test_hedu_course_item(self):
        response = self.client.get('/metadata/hedu_course/724O01')

        course = {
            'name_en': 'Odontology', 
            'name_pt': 'Odontologia'
        }

        self.assertEqual(response.json, course)
        