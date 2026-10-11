
const API_BASE_URL = "http://127.0.0.1:5001";

async function fetchJSON(url) {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not fetch data.");
  }

  return data;
}

export async function getMovies() {
  const data = await fetchJSON(`${API_BASE_URL}/movies`);
  return data.movies;
}

export async function getMovieDetailsByTitle(title) {
  const params = new URLSearchParams({ title });
  const data = await fetchJSON(
    `${API_BASE_URL}/movie-by-title?${params.toString()}`,
  );

  return data.movie;
}

export async function getRecommendations(movieTitle, limit = 5) {
  const params = new URLSearchParams({
    title: movieTitle,
    limit: String(limit),
  });

  return fetchJSON(`${API_BASE_URL}/recommend?${params.toString()}`);
}
