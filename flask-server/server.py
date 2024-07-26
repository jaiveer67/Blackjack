from flask import Flask, jsonify
from game import Game

app = Flask(__name__)

game = Game()

@app.route("/start", methods=["GET"])
def start():
    try:
        game.start()
        return jsonify({
            'player_hand': game.player_hand(),
            'dealer_hand': game.dealer_hand(),
            'player_value': game.player.hand_value(),
            'dealer_value': game.dealer.hand_value(),
    }) 
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)