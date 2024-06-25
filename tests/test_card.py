import unittest
from card import Card

class TestCard(unittest.TestCase):

    def test_card_creation(self):
        card = Card('3', 'Clubs')
        self.assertEqual(card.rank, '3')
        self.assertEqual(card.suit, 'Clubs')
        self.assertEqual(card.rank, 3)
    
if __name__ == '__main__':
    unittest.main()