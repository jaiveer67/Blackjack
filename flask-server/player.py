class Player:
    def __init__(self, name, starting_money=2000):
        self.name = name
        self.hand = []
        self.money = starting_money
        self.current_bet = 0
        self.is_split_hand = False
        self.insurance_bet = 0

    def add_card(self, card):
        self.hand.append(card)

    def hand_value(self):
        value = sum(card.value for card in self.hand)
        ace_count = sum(1 for card in self.hand if card.rank == 'A')
        while value > 21 and ace_count:
            value -= 10
            ace_count -= 1
        return value
    
    def display_hand_value(self):
        total = 0
        ace_count = 0

        for card in self.hand:
            if card.rank == 'A':
                ace_count += 1
            else:
                total += card.value  # card.value is fine for non-aces

        # Min value: treat all Aces as 1
        min_value = total + ace_count * 1

        # Max value: treat one Ace as 11 (10 more than 1), others as 1
        if ace_count >= 1 and min_value + 10 <= 21:
            max_value = min_value + 10
            return f"{min_value} / {max_value}"
        else:
            return str(min_value)
    
    def is_bust(self):
        return self.hand_value() > 21
    
    def str(self):
        return f"{self.name}: {self.hand} (Value: {self.hand_value()})"
    
    def reset_hand(self):
        self.hand = []

    def place_bet(self, amount):
        if amount > self.money:
            raise ValueError("Bet exceeds available money.")
        self.current_bet = amount
        self.money -= amount
    
class Dealer(Player):
    def __init__(self, dealer_hits_soft_17=False):
        super().__init__("Dealer")
        self.dealer_hits_soft_17 = dealer_hits_soft_17

    def should_draw(self):
        value = self.hand_value()
        has_soft_17 = value == 17 and any(card.rank == "A" for card in self.hand) and self.display_hand_value() != value
        if value < 17:
            return True
        if self.dealer_hits_soft_17 and has_soft_17:
            return True
        return False