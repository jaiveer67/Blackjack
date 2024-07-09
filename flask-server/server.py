from flask import Flask, jsonify
from game import Game

app = Flask(__name__)
game = Game()

@app.route('/start', methods=['GET'])
def start_game():
    game.start()
    return jsonify({
        'playerHand': game.player.hand,
        'dealerHand': game.dealer.hand
    })

@app.route('/api/hit', methods=['GET'])
def hit():
    game.player_turn()
    return jsonify({
        'playerHand': game.player.hand,
        'gameOver': game.player.is_bust()
    })

@app.route('/api/stand', methods=['GET'])
def stand():
    game.dealer_turn()
    return jsonify({
        'dealerHand': game.dealer.hand,
        'gameOver': True
    })


if __name__ == "__main__":
    app.run(debug=True)