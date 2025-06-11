import json
import os

SETTINGS_FILE = "settings.json"

def save_settings(deck_count):
    with open(SETTINGS_FILE, "w") as f:
        json.dump({"deck_count": deck_count}, f)

def load_settings():
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, "r") as f:
            return json.load(f).get("deck_count", 6)
    return 1