# Main game logic
from deck import Deck
from player import Player, Dealer
from settings import load_settings

player_wins = 0
dealer_wins = 0
draws = 0
hit = False

class Game:
    def __init__(self):
        settings = load_settings()
        self.num_decks = settings.get("deck_count", 6)
        self.dealer_hits_soft_17 = settings.get("dealer_hits_soft_17", False)

        self.deck = Deck(num_decks=self.num_decks)
        self.player = Player("Player")
        self.split_player = None
        self.dealer = Dealer(dealer_hits_soft_17=self.dealer_hits_soft_17)

        self.max_money = self.player.money
        self.hands_won = 0
        self.last_bet = 0

        self._initialize_game()

    def _initialize_game(self):
        self.deck.shuffle()
        self.player.reset_hand()
        self.dealer.reset_hand()
        self.deal_initial_cards()

    def reset_round(self):
        self.max_money = max(self.max_money, self.player.money)
        self.split_player = None
        self.player.insurance_bet = 0
        settings = load_settings()
        self.deck = Deck(num_decks=settings.get("deck_count", 6))
        self.dealer_hits_soft_17 = settings.get("dealer_hits_soft_17", False)
        self.dealer = Dealer(dealer_hits_soft_17=self.dealer_hits_soft_17)
        self.deck.shuffle()
        self.player.reset_hand()
        self.dealer.reset_hand()
        self.deal_initial_cards()

    def set_rules(self, deck_count, dealer_hits_soft_17):
        self.num_decks = deck_count
        self.dealer_hits_soft_17 = dealer_hits_soft_17
        self.deck = Deck(num_decks=self.num_decks)
        self.dealer = Dealer(dealer_hits_soft_17=self.dealer_hits_soft_17)

    def deal_initial_cards(self):
        self.player.add_card(self.deck.draw_card())
        self.dealer.add_card(self.deck.draw_card())
        self.player.add_card(self.deck.draw_card())
        self.dealer.add_card(self.deck.draw_card())

        # self.player.add_card(Card('7', 'Spades'))
        # self.player.add_card(Card('7', 'Spades'))

        # self.dealer.add_card(Card('A', 'Diamonds'))
        # self.dealer.add_card(Card('6', 'Clubs'))

        # # Force draw order
        # self.deck.cards = [
        #     *self.deck.cards,  # Rest of the deck
        #     Card('2', 'Spades'),
        #     Card('A', 'Diamonds'),
        #     Card('A', 'Clubs'),  # To be drawn by hand 2
        #     Card('A', 'Spades'),  # To be drawn by hand 1
        # ]

    def player_turn(self):
        self.hit = True
        if not self.player.is_bust() and self.hit == True:
            self.player.add_card(self.deck.draw_card())
            self.hit = False
        if self.player.hand_value() == 21:
            self.dealer_turn()

    def dealer_turn(self):
        while self.dealer.should_draw():
            self.dealer.add_card(self.deck.draw_card())

    def player_hand(self):
        return [{'rank': card.rank, 'suit': card.suit, 'value': card.value} for card in self.player.hand]
    
    def player2_hand(self):
        return [{'rank': card.rank, 'suit': card.suit, 'value': card.value} for card in self.split_player.hand] if self.split_player else []
    
    def player_value(self):
        return self.player.hand_value()
    
    def player2_value(self):
        return self.split_player.hand_value() if self.split_player else 0
    
    def dealer_hand(self):
        return [{'rank': card.rank, 'suit': card.suit, 'value': card.value} for card in self.dealer.hand]
        
    def split(self):
        if len(self.player.hand) == 2 and self.player.hand[0].rank == self.player.hand[1].rank:
            if self.player.money < self.player.current_bet:
                raise ValueError("Insufficient funds to split.")
            
            card1 = self.player.hand[0]
            card2 = self.player.hand[1]

            self.split_player = Player("Split Hand")
            self.split_player.is_split_hand = True
            self.player.is_split_hand = True
            self.split_player.current_bet = self.player.current_bet
            self.player.money -= self.player.current_bet
            self.player.hand = [card1]
            self.split_player.hand = [card2]

            self.player.add_card(self.deck.draw_card())
            self.split_player.add_card(self.deck.draw_card())