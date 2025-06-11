import json
import os

SETTINGS_FILE = "settings.json"

def save_settings(deck_count, dealer_hits_soft_17):
    data = {
        "deck_count": deck_count,
        "dealer_hits_soft_17": dealer_hits_soft_17
    }
    with open(SETTINGS_FILE, "w") as f:
        json.dump(data, f)

def load_settings():
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, "r") as f:
            return json.load(f)
    return {
        "deck_count": 6,
        "dealer_hits_soft_17": False
    }