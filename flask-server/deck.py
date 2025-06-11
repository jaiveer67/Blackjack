# The deck class
import random
from card import Card

class Deck:
    def __init__(self, num_decks):
        self.num_decks = num_decks
        self.cards = []
        for _ in range(num_decks):
            self.cards.extend([Card(rank, suit) for rank in Card.ranks for suit in Card.suits])

    def shuffle(self):
        random.shuffle(self.cards);

    def draw_card(self):
        card = self.cards.pop()
        return card