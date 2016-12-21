from decimal import Decimal
from test_base import BaseTestCase  
from factories.secex import SecexFactory
from app.models.secex import Secex


class SecexApiTests(BaseTestCase):

    def tearDown(self):
        Secex.query.delete()

    def test_should_return_10_secex(self):
        SecexFactory.create_batch(10)
        response = self.client.get("/secex/")
        self.assertEqual(len(response.json['data']), 10)

    def test_should_return_2_secex_states(self):
        state_1_secex = SecexFactory.create_batch(10, uf_ibge="01", value=5)
        state_2_secex = SecexFactory.create_batch(10, uf_ibge="02", value=5000)

        response = self.client.get("/secex/states/")
        self.assertEqual(len(response.json['data']), 2)

    def test_should_sum_secex_states_values(self):
        state_1_secex = SecexFactory.create_batch(10, uf_ibge="01", value=5)
        state_1_values = map(lambda x: x.value, state_1_secex)

        state_2_secex = SecexFactory.create_batch(10, uf_ibge="02", value=5000)
        state_2_values = map(lambda x: x.value, state_2_secex)
        
        response = self.client.get("/secex/states/")
        value_1 = Decimal(response.json['data'][0][1])
        value_2 = Decimal(response.json['data'][1][1])

        self.assertEqual(value_1, sum(state_1_values))
        self.assertEqual(value_2, sum(state_2_values))
