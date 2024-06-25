# The deck class
import random
from card import Card

class Deck:
    def __init__(self):
        self.cards = [Card(rank, suit) for rank in Card.ranks for suit in Card.suits]

    def shuffle(self):
        random.shuffle(self.cards);

    def draw_card(self):
        return self.cards.pop