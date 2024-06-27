import unittest
from player import Player, Dealer
from card import Card

class TestPlayer(unittest.TestCase):

    def setUp(self):
        self.player = Player("Test Player")

    def test_hand_value(self):
        self.player.hand = [Card('8', 'Spades'), Card('K', 'Clubs')]
        self.assertEqual(self.player.hand_value(), 18)

    def test_is_bust(self):
        self.player.hand = [Card('8', 'Spades'), Card('K', 'Clubs'), Card('4', 'Diamonds')]
        self.assertTrue(self.player.is_bust())

if __name__ == '__main__':
    unittest.main()