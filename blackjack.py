# Main file to run game

from game import Game

def main():
    game = Game()
    game.start()
    if game.player.wants_to_play_again():
        main()
    else:
        print("\nThanks for playing!")
    
if __name__ == "__main__":
    main()
