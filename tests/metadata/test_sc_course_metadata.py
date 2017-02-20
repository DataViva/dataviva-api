from test_base import BaseTestCase

class TestScCourse(BaseTestCase):

    def test_sc_course_path(self):
        response = self.client.get('/metadata/sc_course')
        self.assert_200(response)

    def test_sc_course_plural_path(self):
        response = self.client.get('/metadata/sc_courses')
        self.assert_200(response)

    def test_sc_course_fields(self):
        response = self.client.get('/metadata/sc_course')

        key, item = response.json.popitem()

        self.assertTrue(item.has_key('name_en'))
        self.assertTrue(item.has_key('name_pt'))
        
    def test_sc_course_item(self):
        response = self.client.get('/metadata/sc_course/01003')

        course = {
            'name_en': 'Biotechnology', 
            'name_pt': 'Biotecnologia'
        }

        self.assertEqual(response.json, course)
        