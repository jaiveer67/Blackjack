import unittest
from game import Game
from player import Player, Dealer
from card import Card

class TestGame(unittest.TestCase):

    def setUp(self):
        self.game = Game()

    def test_initial_deal(self):
        self.game.deal_initial_cards()
        self.assertEqual(len(self.game.player.hand), 2)
        self.assertEqual(len(self.game.dealer.hand), 2)

    def test_player_bust(self):
        self.game.player.hand = [Card('10', 'Hearts'), Card('5', 'Spades'), Card('J', 'Diamonds')]
        self.assertTrue(self.game.player.is_bust())

    def test_dealer_draw(self):
        self.game.dealer.hand = [Card('5', 'Hearts'), Card('5', 'Diamonds')]
        self.game.dealer_turn()
        self.assertGreaterEqual(self.game.dealer.hand_value(), 17)

if __name__ == '__main__':
    unittest.main()