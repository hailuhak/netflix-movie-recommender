import { useState } from 'react';
import { getRecommendations } from './api';
import './App.css';

const sampleMovies = [
   {
      id: 1,
      title: 'Inception',
      year: 2010,
      genre: 'Sci-Fi · Thriller',
      rating: '8.8',
      image: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
   },
   {
      id: 2,
      title: 'The Dark Knight',
      year: 2008,
      genre: 'Action · Crime',
      rating: '9.0',
      image: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
   },
   {
      id: 3,
      title: 'Interstellar',
      year: 2014,
      genre: 'Sci-Fi · Drama',
      rating: '8.7',
      image: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
   },
   {
      id: 4,
      title: 'Avatar',
      year: 2009,
      genre: 'Adventure · Sci-Fi',
      rating: '7.9',
      image: 'https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg',
   },
   {
      id: 5,
      title: 'The Matrix',
      year: 1999,
      genre: 'Sci-Fi · Action',
      rating: '8.7',
      image: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
   },
];

function App() {
   const [search, setSearch] = useState('');
   const [selectedMovie, setSelectedMovie] = useState('');
   const [recommendations, setRecommendations] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const filteredMovies = sampleMovies.filter((movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase()),
   );

   async function handleRecommend(movieTitle) {
      setSelectedMovie(movieTitle);
      setRecommendations([]);
      setError('');
      setLoading(true);

      try {
         const data = await getRecommendations(movieTitle);
         setRecommendations(data.recommendations);
      } catch (err) {
         setError(err.message || 'Something went wrong.');
      } finally {
         setLoading(false);
      }
   }

   return (
      <div className='app'>
         <header className='navbar'>
            <a className='logo' href='#home'>
               CINE<span>VERSE</span>
            </a>

            <nav>
               <a href='#home'>Home</a>
               <a href='#movies'>Movies</a>
               <a href='#recommendations'>Recommendations</a>
            </nav>

            <input
               className='search'
               type='search'
               placeholder='Search movies...'
               value={search}
               onChange={(event) => setSearch(event.target.value)}
               aria-label='Search movies'
            />
         </header>

         <main>
            <section className='hero' id='home'>
               <div className='hero-content'>
                  <p className='eyebrow'>YOUR NEXT FAVORITE MOVIE</p>
                  <h1>Discover stories worth watching.</h1>
                  <p>
                     Explore great movies and find your next favorite with
                     machine-learning recommendations.
                  </p>
                  <a className='primary-button' href='#movies'>
                     Explore Movies
                  </a>
               </div>
            </section>

            <section className='movie-section' id='movies'>
               <div className='section-heading'>
                  <div>
                     <p className='eyebrow'>EXPLORE THE COLLECTION</p>
                     <h2>Popular Movies</h2>
                  </div>
                  <span>{filteredMovies.length} titles</span>
               </div>

               {filteredMovies.length > 0 ? (
                  <div className='movie-grid'>
                     {filteredMovies.map((movie) => (
                        <article className='movie-card' key={movie.id}>
                           <img
                              src={movie.image}
                              alt={`${movie.title} poster`}
                              loading='lazy'
                           />

                           <div className='movie-info'>
                              <div className='movie-title-row'>
                                 <h3>{movie.title}</h3>
                                 <span className='rating'>
                                    ★ {movie.rating}
                                 </span>
                              </div>

                              <p>
                                 {movie.year} · {movie.genre}
                              </p>

                              <button
                                 className='recommend-button'
                                 onClick={() => handleRecommend(movie.title)}
                                 disabled={loading}
                              >
                                 {loading && selectedMovie === movie.title
                                    ? 'Finding movies...'
                                    : 'Find Similar Movies'}
                              </button>
                           </div>
                        </article>
                     ))}
                  </div>
               ) : (
                  <p className='empty-state'>
                     No movies found. Try another title.
                  </p>
               )}
            </section>

            <section className='recommendation-section' id='recommendations'>
               <p className='eyebrow'>POWERED BY MACHINE LEARNING</p>
               <h2>
                  {selectedMovie
                     ? `Movies like ${selectedMovie}`
                     : 'Your next movie starts here.'}
               </h2>

               {!selectedMovie && (
                  <p>
                     Choose a movie above to discover recommendations based on
                     genres, keywords, cast, directors, and story similarities.
                  </p>
               )}

               {loading && (
                  <p role='status'>
                     Our recommendation engine is finding movies...
                  </p>
               )}

               {error && (
                  <p role='alert'>
                     {error} Please check that the Flask backend is running and
                     try another movie.
                  </p>
               )}

               {!loading && !error && recommendations.length > 0 && (
                  <div className='recommendation-list'>
                     {recommendations.map((movie, index) => (
                        <div
                           className='recommendation-item'
                           key={`${movie.title}-${index}`}
                        >
                           <div>
                              <h3>{movie.title}</h3>
                              <p>Similarity score: {movie.similarity_score}</p>
                           </div>
                           <span className='rating'>#{index + 1}</span>
                        </div>
                     ))}
                  </div>
               )}

               {!loading &&
                  !error &&
                  selectedMovie &&
                  recommendations.length === 0 && (
                     <p>No recommendations were returned for this movie.</p>
                  )}
            </section>
         </main>

         <footer>
            <a className='logo' href='#home'>
               CINE<span>VERSE</span>
            </a>
            <p>Discover more. Watch better.</p>
         </footer>
      </div>
   );
}

export default App;
