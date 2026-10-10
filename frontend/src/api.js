
const API_BASE_URL = "http://127.0.0.1:5001";

export async function getRecommendations(movieTitle, limit = 5) {
  const params = new URLSearchParams({
    title: movieTitle,
    limit: String(limit),
  });

  const response = await fetch(
    `${API_BASE_URL}/recommend?${params.toString()}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not fetch recommendations.");
  }

  return data;
}
