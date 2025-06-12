# Main game logic
from deck import Deck
from card import Card
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

    def place_bet(self, amount):
        if amount <= 0 or amount > self.player.money:
            raise ValueError("Invalid bet amount")
        self.player.place_bet(amount)
        self.currentBet = amount

    def handle_payout(self):
        if self.split_player:
            for hand_player in [self.player, self.split_player]:
                self._resolve_hand(hand_player)
        else:
            self._resolve_hand(self.player)

    def _resolve_hand(self, player):
        if player.is_bust():
            player.lose_bet()
        elif self.dealer.is_bust() or player.hand_value() > self.dealer.hand_value():
            if player.has_blackjack():
                player.win_bet(2.5)
            else:
                player.win_bet()
        elif player.hand_value() == self.dealer.hand_value():
            player.push_bet()
        else:
            player.lose_bet()

    # def start(self):
    #     preserved_money = self.player.money
    #     preserved_bet = self.player.current_bet
    #     self.__init__()
    #     self.player.money = preserved_money
    #     self.player.current_bet = preserved_bet
    #     self.currentBet = preserved_bet
    #     if self.player.hand_value() == 21:
    #         self.dealer_turn()

    def deal_initial_cards(self):
        # self.player.add_card(self.deck.draw_card())
        # self.dealer.add_card(self.deck.draw_card())
        # self.player.add_card(self.deck.draw_card())
        # self.dealer.add_card(self.deck.draw_card())

        self.player.add_card(Card('7', 'Spades'))
        self.player.add_card(Card('K', 'Spades'))

        self.dealer.add_card(Card('Q', 'Diamonds'))
        self.dealer.add_card(Card('K', 'Clubs'))

        # Force draw order
        self.deck.cards = [
            *self.deck.cards,  # Rest of the deck
            Card('2', 'Spades'),
            Card('3', 'Diamonds'),
            Card('2', 'Clubs'),  # To be drawn by hand 2
            Card('3', 'Spades'),  # To be drawn by hand 1
        ]

    def player_turn(self):
        self.hit = True
        print(f"\n{self.dealer.name}'s hand: [{self.dealer.hand[0]}, ?]")
        if not self.player.is_bust() and self.hit == True:
            self.player.add_card(self.deck.draw_card())
            self.hit = False
        if self.player.hand_value() == 21:
            self.dealer_turn()

    def dealer_turn(self):
        while self.dealer.should_draw():
            self.dealer.add_card(self.deck.draw_card())

    def show_results(self):
        print("\nFinal Hands:")
        print("Your hand:", self.player.hand, "Value =", self.player.hand_value())
        print("Dealer's hand:", self.dealer.hand, "Value =", self.dealer.hand_value())
        if self.player.is_bust():
            print("You bust! Dealer wins.")
            self.update_score(2)
        elif self.dealer.is_bust():
            print("Dealer busts! You win.")
            self.update_score(1)
        elif self.player.hand_value() > self.dealer.hand_value():
            print("You win!")
            self.update_score(1)
        elif self.player.hand_value() < self.dealer.hand_value():
            print("Dealer wins.")
            self.update_score(2)
        else:
            print("It's a push!")
            self.update_score(3)

    def update_score(self, num):
        global player_wins, dealer_wins, draws
        if num == 1:
            player_wins+=1
        elif num == 2:
            dealer_wins+=1
        else:
            draws+=1
        print("\nYour wins:", player_wins, "\nDealer's wins:", dealer_wins, "\nDraws:", draws)

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
    
    # def double(self):
    #     if self.player.money >= self.player.current_bet:
    #         self.player.money -= self.player.current_bet
    #         self.player.current_bet *= 2
    #         self.player.add_card(self.deck.draw_card())
    #         return {
    #             'playerHand': self.player_hand(),
    #             'playerValue': self.player.hand_value(),
    #             'playerMoney': self.player.money,
    #             'playerDisplayValue': self.player.display_hand_value()
    #         }
    #     else:
    #         return {'error': 'Not enough money to double'}, 400
        
    def split(self):
        if len(self.player.hand) == 2 and self.player.hand[0].value == self.player.hand[1].value:
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