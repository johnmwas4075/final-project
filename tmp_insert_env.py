from pathlib import Path
path = Path('scripts/recommender.py')
text = path.read_text(encoding='utf-8')
if 'def load_env_from_local' not in text:
    insert = '''\n\ndef load_env_from_local():\n    candidates = [\n        os.path.join(os.getcwd(), ".env.local"),\n        os.path.join(os.path.dirname(__file__), "..", ".env.local"),\n    ]\n    for env_path in candidates:\n        if not os.path.exists(env_path):\n            continue\n        with open(env_path, "r", encoding="utf-8") as handle:\n            for raw in handle:\n                line = raw.strip()\n                if not line or line.startswith("#"):\n                    continue\n                if "=" not in line:\n                    continue\n                key, value = line.split("=", 1)\n                key = key.strip()\n                value = value.strip().strip('"').strip("'")\n                os.environ.setdefault(key, value)\n        return\n\n'''
    idx = text.find('def connect')
    if idx != -1:
        text = text[:idx] + insert + text[idx:]
    else:
        text = text + insert
    path.write_text(text, encoding='utf-8')
print('ok')
