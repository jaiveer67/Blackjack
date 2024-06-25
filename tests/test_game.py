import unittest
from game import Game
from player import PLayer, Dealer

class TestGame(unittest.TestCase):

    def setUp(self):
        self.deck = Deck()
        
    def test_deck_initialization(self):
        self.assertEqual(len(self.deck.cards), 52)

    def test_draw_card(self):
        card = self.deck.draw_card
        self.assertIsInstance(card, Card)
        self.assertEqual(len(self.deck.cards), 51)

if __name__ == '__main__':
    unittest.main()