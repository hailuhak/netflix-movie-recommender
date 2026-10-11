import { useEffect, useState } from 'react';
import { getMovies, getMovieDetailsByTitle, getRecommendations } from './api';
import './App.css';

function App() {
   const [search, setSearch] = useState('');
   const [allMovies, setAllMovies] = useState([]);
   const [movieDetails, setMovieDetails] = useState({});
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

   // Load movie titles from Flask.
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

   const filteredMovies = allMovies.filter((title) =>
      title.toLowerCase().includes(search.trim().toLowerCase()),
   );

   const titlesToDisplay = search.trim() ? filteredMovies : allMovies;

   // Only prepare the five movies currently visible.
   const visibleMovies = titlesToDisplay
      .slice(currentIndex, currentIndex + 5)
      .map((title) => {
         const details = movieDetails[title.toLowerCase()];

         return {
            id: title,
            title,
            poster_url: details?.poster_url || null,
            genres: details?.genres || 'Loading movie details...',
            overview: details?.overview || '',
            rating: details?.rating ?? null,
            release_date: details?.release_date || null,
            cast: details?.cast || '',
            director: details?.director || '',
         };
      });

   // Fetch metadata only for movies currently visible.
   const visibleTitlesKey = visibleMovies.map((movie) => movie.title).join('|');

   useEffect(() => {
      let cancelled = false;

      async function loadVisibleDetails() {
         const titles = visibleTitlesKey ? visibleTitlesKey.split('|') : [];

         const missingTitles = [
            ...new Set(
               titles.filter((title) => !movieDetails[title.toLowerCase()]),
            ),
         ];

         await Promise.all(
            missingTitles.map(async (title) => {
               try {
                  const details = await getMovieDetailsByTitle(title);

                  if (!cancelled) {
                     setMovieDetails((previous) => ({
                        ...previous,
                        [title.toLowerCase()]: details,
                     }));
                  }
               } catch {
                  // Keep the movie visible even if metadata is unavailable.
                  if (!cancelled) {
                     setMovieDetails((previous) => ({
                        ...previous,
                        [title.toLowerCase()]: {
                           title,
                           poster_url: null,
                           genres: 'Movie information unavailable',
                           overview: '',
                           rating: null,
                           release_date: null,
                        },
                     }));
                  }
               }
            }),
         );
      }

      loadVisibleDetails();

      return () => {
         cancelled = true;
      };
   }, [visibleTitlesKey, movieDetails]);

   async function handleRecommend(movieTitle) {
      setSelectedMovie(movieTitle);
      setRecommendations([]);
      setError('');
      setLoading(true);

      try {
         const data = await getRecommendations(movieTitle);

         setRecommendations(data.recommendations || []);

         // Cache the selected movie's metadata if returned by the API.
         if (data.requested_movie) {
            setMovieDetails((previous) => ({
               ...previous,
               [movieTitle.toLowerCase()]: data.requested_movie,
            }));
         }

         // Cache recommendation details for future browsing.
         if (data.recommendations) {
            setMovieDetails((previous) => {
               const updated = { ...previous };

               data.recommendations.forEach((movie) => {
                  updated[movie.title.toLowerCase()] = {
                     ...updated[movie.title.toLowerCase()],
                     ...movie,
                  };
               });

               return updated;
            });
         }

         document
            .getElementById('recommendations')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (err) {
         setError(err.message || 'Could not fetch recommendations.');
      } finally {
         setLoading(false);
      }
   }

   function renderPoster(movie, className = 'movie-poster') {
      if (movie.poster_url) {
         return (
            <img
               className={className}
               src={movie.poster_url}
               alt={`${movie.title} poster`}
               loading='lazy'
            />
         );
      }

      return (
         <div className='poster-placeholder'>
            <span>CINEVERSE</span>
            <strong>{movie.title}</strong>
            <small>Poster unavailable</small>
         </div>
      );
   }

   function renderMovieInfo(movie) {
      const year = movie.release_date ? movie.release_date.slice(0, 4) : null;

      return (
         <>
            <div className='movie-title-row'>
               <h3>{movie.title}</h3>

               {movie.rating != null && (
                  <span className='rating'>
                     ★ {Number(movie.rating).toFixed(1)}
                  </span>
               )}
            </div>

            <p className='movie-meta'>
               {year ? `${year} · ` : ''}
               {movie.genres || 'Movie'}
            </p>
         </>
      );
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
                     {moviesError} Please make sure Flask is running.
                  </p>
               ) : titlesToDisplay.length > 0 ? (
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
                                 {renderPoster(movie)}

                                 <div className='movie-info'>
                                    {renderMovieInfo(movie)}

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
                                    Math.max(0, titlesToDisplay.length - 5),
                                    index + 1,
                                 ),
                              )
                           }
                           disabled={currentIndex >= titlesToDisplay.length - 5}
                           aria-label='Next movie'
                           title='Next movie'
                        >
                           &#8594;
                        </button>
                     </div>

                     <p className='carousel-counter'>
                        Movies {currentIndex + 1}–
                        {Math.min(currentIndex + 5, titlesToDisplay.length)} of{' '}
                        {titlesToDisplay.length}
                     </p>
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

               {error && <p role='alert'>{error}</p>}

               {!loading && !error && recommendations.length > 0 && (
                  <div className='recommendation-grid'>
                     {recommendations.map((movie, index) => (
                        <article
                           className='recommendation-card'
                           key={`${movie.id}-${movie.title}`}
                        >
                           {renderPoster(movie, 'recommendation-poster')}

                           <div className='recommendation-info'>
                              {renderMovieInfo(movie)}

                              <p className='similarity-score'>
                                 Similarity score:{' '}
                                 {Number(movie.similarity_score).toFixed(3)}
                              </p>

                              {movie.overview && (
                                 <p className='recommendation-overview'>
                                    {movie.overview}
                                 </p>
                              )}

                              <span className='recommendation-rank'>
                                 #{index + 1}
                              </span>

                              <button
                                 className='recommend-button'
                                 onClick={() => handleRecommend(movie.title)}
                                 disabled={loading}
                              >
                                 Find Similar Movies
                              </button>
                           </div>
                        </article>
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
