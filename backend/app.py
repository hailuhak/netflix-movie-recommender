
import pickle
from pathlib import Path

from flask import Flask, jsonify, request

app = Flask(__name__)

# Find the project root directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load the saved movie data and similarity matrix
with open(BASE_DIR / "movie_list.pkl", "rb") as file:
    movies = pickle.load(file)

with open(BASE_DIR / "similarity.pkl", "rb") as file:
    similarity = pickle.load(file)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Netflix Movie Recommender API",
        "status": "running"
    })


@app.route("/movies", methods=["GET"])
def get_movies():
    return jsonify({
        "movies": movies["title"].tolist()
    })


@app.route("/recommend", methods=["GET"])
def recommend():
    movie_title = request.args.get("title", "").strip()
    limit = request.args.get("limit", default=5, type=int)

    if not movie_title:
        return jsonify({
            "error": "Please provide a movie title."
        }), 400

    if limit is None or limit < 1 or limit > 20:
        return jsonify({
            "error": "Limit must be between 1 and 20."
        }), 400

    matches = movies.index[
        movies["title"].str.casefold() == movie_title.casefold()
    ]

    if len(matches) == 0:
        return jsonify({
            "error": f"Movie not found: {movie_title}"
        }), 404

    movie_index = int(matches[0])

    scores = list(enumerate(similarity[movie_index]))
    scores.sort(key=lambda item: item[1], reverse=True)

    # Exclude the movie itself
    scores = [
        item for item in scores
        if item[0] != movie_index
    ]

    recommendations = []

    for index, score in scores[:limit]:
        recommendations.append({
            "title": str(movies.iloc[index]["title"]),
            "similarity_score": round(float(score), 3)
        })

    return jsonify({
        "requested_movie": str(movies.iloc[movie_index]["title"]),
        "recommendations": recommendations
    })


if __name__ == "__main__":
    app.run(debug=True, port=5001)
