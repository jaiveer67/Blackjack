# Main game logic
from deck import Deck
from player import Player, Dealer

class Game:
    def __init__(self):
        self.deck = Deck()
        self.player = Player("Player")
        self.dealer = Dealer("Dealer")

    def start(self):
        print("Welcome to my Blackjack game!")
        self.deck.shuffle()
        self.deal_initial_cards()
        self.player_turn()
        self.dealer_turn()
        self.show_results()

    def deal_initial_cards(self):
        self.player.add_card(self.deck.draw_card())
        self.dealer.add_card(self.deck.draw_card())
        self.player.add_card(self.deck.draw_card())
        self.dealer.add_card(self.deck.draw_card())

    def player_turn(self):
        while not self.player.is_bust() and self.player.wants_to_hit():
            self.player.add_card(self.deck.draw_card())

    def dealer_turn(self):
        while self.dealer.should_draw():
            self.dealer.add_card(self.deck.draw_card())

    def show_results(self):
        print("\nFinal Hands:")
        print("Your hand:", self.player.hand, "Value =", self.player.hand_value())
        print("Dealer's hand:", self.dealer.hand, "Value =", self.dealer.hand_value())
        if self.player.is_bust():
            print("You bust! Dealer wins.")
        elif self.dealer.is_bust():
            print("Dealer busts! You win.")
        elif self.player.hand_value() > self.dealer.hand_value():
            print("You win!")
        elif self.player.hand_value() < self.dealer.hand_value():
            print("Dealer wins.")
        else:
            print("It's a push!")
