from test_base import BaseTestCase


class SecexApiTests(BaseTestCase):

    def test_should_respond_ok_to_secex_path(self):
        response = self.client.get('/secex/')
        self.assert_200(response)