import { useEffect, useState } from 'react';
import { getMovies, getRecommendations } from './api';
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
   const [allMovies, setAllMovies] = useState([]);
   const [moviesLoading, setMoviesLoading] = useState(true);
   const [moviesError, setMoviesError] = useState('');
   const [currentIndex, setCurrentIndex] = useState(0);
   const [selectedMovie, setSelectedMovie] = useState('');
   const [recommendations, setRecommendations] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');


  useEffect(() => {
     setCurrentIndex(0);
  }, [search]);

   // Load the full movie dataset from Flask.
   useEffect(() => {
      async function loadMovies() {
         try {
            const titles = await getMovies();
            setAllMovies(titles);
         } catch (err) {
            setMoviesError(err.message || 'Could not load movies.');
         } finally {
            setMoviesLoading(false);
         }
      }

      loadMovies();
   }, []);

   // Search all movie titles, not just the featured movies.
   const filteredMovies = allMovies.filter((title) =>
      title.toLowerCase().includes(search.trim().toLowerCase()),
   );

   // Keep the original poster cards when no search is entered.
   // Show matching titles from the complete dataset when searching.

const titlesToDisplay = search.trim() ? filteredMovies : allMovies;

const displayMovies = titlesToDisplay.map((title) => {
   const featuredMovie = sampleMovies.find(
      (movie) => movie.title.toLowerCase() === title.toLowerCase(),
   );

   return (
      featuredMovie || {
         id: title,
         title,
         year: null,
         genre: 'Movie',
         rating: null,
         image: null,
      }
   );
});

const visibleMovies = displayMovies.slice(currentIndex, currentIndex + 5);


   async function handleRecommend(movieTitle) {
      setSelectedMovie(movieTitle);
      setRecommendations([]);
      setError('');
      setLoading(true);

      try {
         const data = await getRecommendations(movieTitle);
         setRecommendations(data.recommendations);
      } catch (err) {
         setError(err.message || 'Could not fetch recommendations.');
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
               placeholder='Search all 4,803 movies...'
               value={search}
               onChange={(event) => setSearch(event.target.value)}
               aria-label='Search all movies'
            />
         </header>

         <main>
            <section className='hero' id='home'>
               <div className='hero-content'>
                  <p className='eyebrow'>YOUR NEXT FAVORITE MOVIE</p>

                  <h1>Discover stories worth watching.</h1>

                  <p>
                     Explore great movies and find your next favorite with
                     personalized machine-learning recommendations.
                  </p>

                  <a className='primary-button' href='#movies'>
                     Explore Movies
                  </a>
               </div>
            </section>

            <section className='movie-section' id='movies'>
               <div className='section-heading'>
                  <div>
                     <p className='eyebrow'>
                        {search.trim()
                           ? 'SEARCH THE FULL COLLECTION'
                           : 'EXPLORE THE COLLECTION'}
                     </p>

                     <h2>
                        {search.trim() ? 'Search Results' : 'Popular Movies'}
                     </h2>
                  </div>

                  <span>
                     {moviesLoading
                        ? 'Loading...'
                        : search.trim()
                          ? `${filteredMovies.length} matches`
                          : `${allMovies.length.toLocaleString()} movies`}
                  </span>
               </div>

               {moviesLoading ? (
                  <p role='status'>Loading your movie collection...</p>
               ) : moviesError ? (
                  <p className='empty-state' role='alert'>
                     {moviesError} Please make sure the Flask backend is
                     running.
                  </p>
               ) : displayMovies.length > 0 ? (
                  <>
                     <div className='movie-carousel'>
                        <button
                           className='carousel-arrow'
                           onClick={() =>
                              setCurrentIndex((index) => Math.max(0, index - 1))
                           }
                           disabled={currentIndex === 0}
                           aria-label='Previous movie'
                           title='Previous movie'
                        >
                           &#8592;
                        </button>

                        <div className='movie-grid'>
                           {visibleMovies.map((movie) => (
                              <article className='movie-card' key={movie.id}>
                                 {movie.image ? (
                                    <img
                                       src={movie.image}
                                       alt={`${movie.title} poster`}
                                       loading='lazy'
                                    />
                                 ) : (
                                    <div className='poster-placeholder'>
                                       <span>CINEVERSE</span>
                                       <strong>{movie.title}</strong>
                                    </div>
                                 )}

                                 <div className='movie-info'>
                                    <div className='movie-title-row'>
                                       <h3>{movie.title}</h3>
                                       {movie.rating && (
                                          <span className='rating'>
                                             ★ {movie.rating}
                                          </span>
                                       )}
                                    </div>

                                    <p>
                                       {movie.year ? `${movie.year} · ` : ''}
                                       {movie.genre}
                                    </p>

                                    <button
                                       className='recommend-button'
                                       onClick={() =>
                                          handleRecommend(movie.title)
                                       }
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

                        <button
                           className='carousel-arrow'
                           onClick={() =>
                              setCurrentIndex((index) =>
                                 Math.min(
                                    Math.max(0, displayMovies.length - 5),
                                    index + 1,
                                 ),
                              )
                           }
                           disabled={currentIndex >= displayMovies.length - 5}
                           aria-label='Next movie'
                           title='Next movie'
                        >
                           &#8594;
                        </button>
                     </div>

                     <p className='carousel-counter'>
                        {displayMovies.length === 0
                           ? 'No movies'
                           : `Movies ${currentIndex + 1}–${Math.min(
                                currentIndex + 5,
                                displayMovies.length,
                             )} of ${displayMovies.length}`}
                     </p>

                     {search.trim() && filteredMovies.length > 30 && (
                        <p className='empty-state'>
                           Showing 30 results. Refine your search to find a
                           specific movie.
                        </p>
                     )}
                  </>
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
                     Choose a movie to discover recommendations based on genres,
                     keywords, cast, directors, and story similarities.
                  </p>
               )}

               {loading && (
                  <p role='status'>
                     Our recommendation engine is finding movies...
                  </p>
               )}

               {error && (
                  <p role='alert'>
                     {error} Please try selecting the movie again.
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
