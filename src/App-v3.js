import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";



const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = '70643b65';

export default function App() {
  const [query, setQuery] = useState("");

  const [selectId, setSelectedId] = useState(null)

  const { movies, isLoading, error } = useMovies(query);

  const [watched, setWatched] = useLocalStorageState([], "watched");




  function handleSelectMovie(id) {
    setSelectedId((selectId) => (id === selectId ? null : id))
  }
  function handleCloseMovie() {
    setSelectedId(null)
  }
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie])

    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id))
  }




  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <NumResult movie={movies} />
      </Navbar>
      <Main >
        <Box >
          {/* {isLoading ? <Loader /> : < MoviesList movies={movies} />} */}
          {isLoading && < Loader />}
          {!isLoading && !error && < MoviesList movies={movies} onSelectMovie={handleSelectMovie} />}
          {error && <ErrorMessage message={error} />}

        </Box>
        <Box>
          {selectId ? <MovieDetails selectId={selectId} onCloseMovie={handleCloseMovie} onAddWatched={handleAddWatched} watched={watched} /> :
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatched} />
            </>}
        </Box>

      </Main>
    </>
  );
}

function Loader() {
  return (
    <p className="loader">LOADING...</p>
  )
}

function ErrorMessage({ message }) {
  return <p className="error">
    <span>⛔</span>{message}
  </p>
}
function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}

    </nav>
  )
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>

  )
}

function Search({ query, setQuery }) {

  const inputEl = useRef(null);

  useEffect(function () {
    function callback(e) {

      if (document.activeElement === inputEl.current) return;
      if (e.code === "Enter") {
        inputEl.current.focus();
        setQuery("");
      }

    }
    document.addEventListener("keydown", callback)
    return () => document.addEventListener("keydown", callback)



  }, [setQuery])
  // useEffect(function (){
  //   const el = document.querySelector(".search");
  //   console.log(el);
  //   e.focus();
  // },[])

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />

  )
}


function NumResult() {
  return (
    <p className="num-results">
      Found <strong>X</strong> results
    </p>
  )
}
function Main({ children }) {
  return (
    <main className="main">
      {children}

      {/* <MoviesList /> */}
    </main>
  )
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen &&
        children
      }
    </div>
  )
}

function MoviesList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (<Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />))}
    </ul>
  )
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)} >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}
function MovieDetails({ selectId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState();
  const [userRating, setUserRating] = useState('');
  const isWatched = watched.map(movie => movie.imdbID).includes(selectId);

  const countRef = useRef(0);
  let count = 0;

  useEffect(function () {
    if (userRating) countRef.current++;


  }, [userRating])

  const watchedUserRating = watched.find(movie => movie.imdbID === selectId)?.userRating;



  const { Title: title, Year: year, Poster: poster, Runtime: runtime, imdbRating, Plot: plot, Released: released, Actors: actors,
    Director: director, Genre: genre,
  } = movie;





  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectId,
      title,
      poster,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split("").at(0)),
      userRating,
      countRatingDecision: countRef.current,


    }
    onAddWatched(newWatchedMovie)
    onCloseMovie();
  }

  // setAvgRating(Number(imdbRating));
  // setAvgRating((avgRating) => (avgRating + userRating) / 2);


  useEffect(function () {
    function Callback(e) {
      if (e.code === "Escape") {
        onCloseMovie();
        console.log("CLOSING");
      }
    }

    document.addEventListener("keydown", Callback);
    return function () {
      document.removeEventListener("keydown", Callback);
    }
  }, [onCloseMovie])


  useEffect(function () {

    async function getMovieDetails() {
      setIsLoading(true)
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectId}`);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false)
    }
    getMovieDetails();
  }, [selectId])


  useEffect(function () {
    if (!title) return
    document.title = `${title}`;
    return function () {
      document.title = "usePopCorn";
    }
  }, [title])


  return (
    <div className="details">
      {isLoading ? <Loader /> : null}
      <header className="details-overview">
        <button className="btn-back" onClick={() => onCloseMovie()}>&larr;</button>
        <img src={poster} alt={`Poster of ${movie}`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>{released} &bull; {runtime}</p>
          <p>{genre}</p>
          <p><span>⭐</span>{imdbRating} IMDB Rating</p>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating maxRating={10} size={24} onSetRating={setUserRating} />

                  {userRating > 0 && <button className="btn-add" onClick={handleAdd}>+ Add to list</button>}
                </>
              ) : (
                <p>You have rated this movie {watchedUserRating} 🌟</p>
              )}
            </div>
            <p><em>{plot}</em></p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </div>
      </header>
      {selectId}
    </div>
  );


}


function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  )
}
function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (

    <ul className="list">
      {watched.map((movie) => (<WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched} />))}
    </ul>
  )
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>X</button>
      </div>
    </li>
  )
}

