# Card class

class Card:
    suits = ['Spades', 'Clubs', 'Hearts' , 'Diamonds']
    ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    values = {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11}

def __init__(self, rank, suit):
    self.rank = rank
    self.suit = suit
    self.value = Card.values[rank]

def __repr__(self):
    return f"{self.rank} of {self.suit}"