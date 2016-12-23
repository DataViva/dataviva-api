from decimal import Decimal
from test_base import BaseTestCase  
from factories.secex import SecexFactory
from app.models.secex import Secex


class SecexStatesTests(BaseTestCase):

    def tearDown(self):
        Secex.query.delete()

    def test_should_return_2_secex_states(self):
        state_1_secex = SecexFactory.create_batch(10, state="01", value=5)
        state_2_secex = SecexFactory.create_batch(10, state="02", value=5000)

        response = self.client.get("/secex/states/")
        self.assertEqual(len(response.json['data']), 2)

    def test_should_sum_secex_states_values(self):
        state_1_secex = SecexFactory.create_batch(10, state="01")
        state_1_values = map(lambda x: x.value, state_1_secex)

        state_2_secex = SecexFactory.create_batch(10, state="02")
        state_2_values = map(lambda x: x.value, state_2_secex)
        
        response = self.client.get("/secex/states/")
        value_1 = Decimal(response.json['data'][0][-2])
        value_2 = Decimal(response.json['data'][1][-2])

        self.assertEqual(value_1, sum(state_1_values))
        self.assertEqual(value_2, sum(state_2_values))

    def test_shoul_return_3_secex_states_filtered_by_product(self):
        SecexFactory.create_batch(3, product="8215")
        SecexFactory.create_batch(10, product="8216")
        SecexFactory.create_batch(10, product="8217")

        response = self.client.get("/secex/states/?product=8215")
        self.assertEqual(len(response.json['data']), 3)

    def test_shoul_return_invalid_filter(self):
        response = self.client.get("/secex/states/?churros=8215")
        self.assertEqual(response.status_code, 403)

