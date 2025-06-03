# Main game logic
from deck import Deck
from player import Player, Dealer

player_wins = 0
dealer_wins = 0
draws = 0
hit = False

class Game:
    def __init__(self):
        self.deck = Deck()
        self.player = Player("Player")
        self.split_player = None
        self.dealer = Dealer("Dealer")
        self.player_wins = player_wins
        self.dealer_wins = dealer_wins
        self.draws = draws
        self.hit = hit
        self.deck.shuffle()
        self.player.reset_hand()
        self.dealer.reset_hand()
        self.deal_initial_cards()

    def start(self):
        print("\nWelcome to my Blackjack game!")
        self.__init__()
        if self.player.hand_value() == 21:
            self.dealer_turn()
        # if not self.player.has_blackjack():
        #     self.player_turn()
        # if not self.player.is_bust():
        #     self.dealer_turn()
        # self.show_results()

    def deal_initial_cards(self):
        self.player.add_card(self.deck.draw_card())
        self.dealer.add_card(self.deck.draw_card())
        self.player.add_card(self.deck.draw_card())
        self.dealer.add_card(self.deck.draw_card())

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
        return [{'suit': card.suit, 'rank': card.rank} for card in self.player.hand]
    
    def player2_hand(self):
        return [{'suit': card.suit, 'rank': card.rank, 'value': card.value} for card in self.split_player.hand] if self.split_player else []
    
    def player_value(self):
        return self.player.hand_value()
    
    def player2_value(self):
        return self.split_player.hand_value() if self.split_player else 0
    
    def dealer_hand(self):
        return [{'suit': card.suit, 'rank': card.rank} for card in self.dealer.hand]
    
    def split(self):
        if len(self.player.hand) == 2 and self.player.hand[0].value == self.player.hand[1].value:
            card1 = self.player.hand[0]
            card2 = self.player.hand[1]

            self.split_player = Player("Split Hand")
            self.player.hand = [card1]
            self.split_player.hand = [card2]

            self.player.add_card(self.deck.draw_card())
            self.split_player.add_card(self.deck.draw_card())