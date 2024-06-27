# Main file to run game

from game import Game

player_wins = 0
dealer_wins = 0
draws = 0

def main():
    game = Game()
    game.start()
    update_score()
    if game.player.wants_to_play_again():
        main()

def update_score(num):
    if num == 1:
        player_wins+=1
    elif num == 2:
        dealer_wins+=1
    else:
        draws+=1
    print("Your wins:", player_wins, "Dealer wins", dealer_wins, "Draws", draws)
    

if __name__ == "__main__":
    main()
