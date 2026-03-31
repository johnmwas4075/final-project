import os
import math
from collections import defaultdict
from datetime import datetime

try:
    import psycopg2
except ImportError:  # pragma: no cover
    raise SystemExit("psycopg2 is required. Run: pip install psycopg2-binary")

FEATURES = ["cleanliness", "accuracy", "communication", "location", "checkin", "value"]


def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)




def load_env_from_local():
    candidates = [
        os.path.join(os.getcwd(), ".env.local"),
        os.path.join(os.path.dirname(__file__), "..", ".env.local"),
    ]
    for env_path in candidates:
        if not os.path.exists(env_path):
            continue
        with open(env_path, "r", encoding="utf-8") as handle:
            for raw in handle:
                line = raw.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                os.environ.setdefault(key, value)
        return

def connect():
    if not os.getenv("DATABASE_URL"):
        load_env_from_local()
    url = os.getenv("DATABASE_URL")
    if not url:
        raise SystemExit("DATABASE_URL is not set. Add it to .env.local or set it in the environment.")
    return psycopg2.connect(url)


def fetch_data(conn):
    cur = conn.cursor()
    cur.execute('SELECT id FROM "Property"')
    properties = [row[0] for row in cur.fetchall()]

    cur.execute(
        'SELECT "propertyId", "userId", stars, cleanliness, accuracy, communication, location, checkin, value FROM "Review"'
    )
    reviews = cur.fetchall()

    cur.execute('SELECT "userId", "propertyId" FROM "Booking"')
    bookings = cur.fetchall()

    return properties, reviews, bookings


def build_vectors(properties, reviews):
    property_scores = defaultdict(lambda: [0.0] * len(FEATURES))
    property_counts = defaultdict(int)
    property_stars = defaultdict(float)

    user_scores = defaultdict(lambda: [0.0] * len(FEATURES))
    user_counts = defaultdict(int)

    for row in reviews:
        prop_id, user_id = row[0], row[1]
        stars = float(row[2] or 0)
        ratings = [float(row[i] or 0) for i in range(3, 9)]

        property_counts[prop_id] += 1
        property_stars[prop_id] += stars
        for i, value in enumerate(ratings):
            property_scores[prop_id][i] += value

        user_counts[user_id] += 1
        for i, value in enumerate(ratings):
            user_scores[user_id][i] += value

    property_vectors = {}
    property_popularity = {}
    for prop_id in properties:
        count = property_counts[prop_id]
        if count > 0:
            property_vectors[prop_id] = [value / count for value in property_scores[prop_id]]
            property_popularity[prop_id] = property_stars[prop_id] / count
        else:
            property_vectors[prop_id] = [0.0] * len(FEATURES)
            property_popularity[prop_id] = 0.0

    user_vectors = {}
    for user_id, count in user_counts.items():
        if count > 0:
            user_vectors[user_id] = [value / count for value in user_scores[user_id]]

    return property_vectors, property_popularity, user_vectors


def build_cooccurrence(bookings):
    user_props = defaultdict(set)
    prop_users = defaultdict(set)

    for user_id, prop_id in bookings:
        user_props[user_id].add(prop_id)
        prop_users[prop_id].add(user_id)

    cooccur = defaultdict(lambda: defaultdict(int))
    for user_id, props in user_props.items():
        for prop_id in props:
            for other_user in prop_users[prop_id]:
                if other_user == user_id:
                    continue
                for other_prop in user_props[other_user]:
                    if other_prop not in props:
                        cooccur[user_id][other_prop] += 1

    return user_props, cooccur


def normalize_scores(scores):
    if not scores:
        return {}
    max_value = max(scores.values())
    if max_value == 0:
        return {key: 0.0 for key in scores}
    return {key: value / max_value for key, value in scores.items()}


def build_recommendations(properties, property_vectors, property_popularity, user_vectors, user_props, cooccur, top_n=12):
    popularity_norm = normalize_scores(property_popularity)
    recommendations = defaultdict(list)

    for user_id in set(list(user_props.keys()) + list(user_vectors.keys())):
        base_props = user_props.get(user_id, set())
        co_scores = normalize_scores(cooccur.get(user_id, {}))
        user_vector = user_vectors.get(user_id)

        scores = {}
        for prop_id in properties:
            if prop_id in base_props:
                continue
            sim = cosine(user_vector, property_vectors[prop_id]) if user_vector else 0.0
            co = co_scores.get(prop_id, 0.0)
            pop = popularity_norm.get(prop_id, 0.0)
            score = 0.6 * sim + 0.2 * co + 0.2 * pop
            scores[prop_id] = score

        ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)[:top_n]
        recommendations[user_id] = ranked

    return recommendations


def save_recommendations(conn, recommendations):
    cur = conn.cursor()
    for user_id, recs in recommendations.items():
        cur.execute('DELETE FROM recommendations WHERE "userId" = %s', (user_id,))
        if not recs:
            continue
        values = [(user_id, prop_id, float(score), datetime.utcnow()) for prop_id, score in recs]
        args_str = ",".join(cur.mogrify("(%s,%s,%s,%s)", v).decode("utf-8") for v in values)
        cur.execute(
            'INSERT INTO recommendations ("userId", "propertyId", score, "createdAt") VALUES ' + args_str
        )
    conn.commit()


def main():
    conn = connect()
    try:
        properties, reviews, bookings = fetch_data(conn)
        property_vectors, property_popularity, user_vectors = build_vectors(properties, reviews)
        user_props, cooccur = build_cooccurrence(bookings)
        recommendations = build_recommendations(
            properties, property_vectors, property_popularity, user_vectors, user_props, cooccur
        )
        save_recommendations(conn, recommendations)
        print("Recommendations updated for", len(recommendations), "users")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
