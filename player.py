# Player and Dealer classes

class Player:
    def __init__(self, name):
        self.name = name
        self.hand = []

    def add_card(self, card):
        self.hand.append(card)

    def hand_value(self):
        value = sum(card.value for card in self.hand)
        ace_count = sum(1 for card in self.hand if card.rank == 'A')
        while value > 21 and ace_count:
            value -= 10
            ace_count -= 1
        return value
    
    def is_bust(self):
        return self.hand_value() > 21
    
    def wants_to_hit(self):
        print(f"\n{self.name}'s hand: {self.hand}")
        print(f"Total value: {self.hand_value()}")
        return input("Do you want to hit? (y/n) ").lower() == 'y'
    
    def str(self):
        return f"{self.name}: {self.hand} (Value: {self.hand_value()})"
    
    def wants_to_play_again(self):
        return input("Do you want to play again? (y/n) ").lower() == 'y'
    
class Dealer(Player):
        def should_draw(self):
            return self.hand_value() < 17