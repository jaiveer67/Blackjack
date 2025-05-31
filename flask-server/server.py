from flask import Flask, jsonify
from game import Game

app = Flask(__name__)

game = Game()

@app.route("/start", methods=["GET"])
def start():
    game.start()
    return jsonify({
        'playerHand': game.player_hand(),
        'dealerHand': game.dealer_hand(),
        'playerValue': game.player.hand_value(),
        'dealerValue': game.dealer.hand[0].value,
    })

@app.route("/hit", methods=['GET'])
def hit():
    game.player_turn()
    return jsonify({
        'playerHand': game.player_hand(),
        'gameOver': game.player.is_bust(),
        'playerValue': game.player.hand_value(),
    })

@app.route("/stand", methods=['GET'])
def stand():
    game.dealer_turn()
    return jsonify({
        'dealerHand': game.dealer_hand(),
        'dealerValue': game.dealer.hand_value(),
        'gameOver': True
    }) 

if __name__ == "__main__":
    app.run(debug=True)