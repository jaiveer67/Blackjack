# Main game logic
from deck import Deck
from card import Card
from player import Player, Dealer

player_wins = 0
dealer_wins = 0
draws = 0

class Game:
    def __init__(self):
        self.deck = Deck()
        self.player = Player("Player")
        self.dealer = Dealer("Dealer")
        self.player_wins = player_wins
        self.dealer_wins = dealer_wins
        self.draws = draws

    def start(self):
        print("\nWelcome to my Blackjack game!")
        self.deck.shuffle()
        self.deal_initial_cards()
        if not self.player.has_blackjack():
            self.player_turn()
        if not self.player.is_bust():
            self.dealer_turn()
        self.show_results()

    def deal_initial_cards(self):
        card1 = Card("7", "Spades")
        card2 = Card("7", "Clubs")
        self.player.add_card(card1)
        self.player.add_card(card2)

        # self.player.add_card(self.deck.draw_card())
        self.dealer.add_card(self.deck.draw_card())
        # self.player.add_card(self.deck.draw_card())
        self.dealer.add_card(self.deck.draw_card())

    def player_turn(self):
        print(f"\n{self.dealer.name}'s hand: [{self.dealer.hand[0]}, ?]")
        while not self.player.is_bust() and not self.player.hand_value() == 21 and self.player.wants_to_hit():
            self.player.add_card(Card("7", "Diamonds"))
            #self.player.add_card(self.deck.draw_card())

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