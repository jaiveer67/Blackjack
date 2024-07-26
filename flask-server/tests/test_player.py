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

    def test_has_blackjack(self):
        self.player.hand = [Card('A', 'Spades'), Card('K', 'Clubs')]
        self.assertTrue(self.player.has_blackjack())

if __name__ == '__main__':
    unittest.main()