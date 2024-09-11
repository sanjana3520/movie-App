// New! Keyboard shortcuts … Drive keyboard shortcuts have been updated to give you first-letters navigation
const APIURL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=20de37ec5318fefba13784367c0d8718&page=1";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?&api_key=20de37ec5318fefba13784367c0d8718&query=";
const MOVIEDETAILSAPI = "https://api.themoviedb.org/3/movie/";
const apiKey = "20de37ec5318fefba13784367c0d8718";
const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const watchlistBtn = document.getElementById("watchlistBtn");
const goBackBtn = document.getElementById("goBackBtn");
const header = document.getElementById("header");
let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
let displayedMovieIds = new Set();
getMovies(APIURL);
async function getMovies(url) {
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Network response was not ok');
        const respData = await resp.json();
        showMovies(respData.results);
        hideGoBackButton();
        showSearchForm(); 
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}
async function showMovies(movies) {
    main.innerHTML = ""; 
    displayedMovieIds.clear(); 
   if (movies.length === 0) {
        const noMovieMessage = document.createElement('div');
        noMovieMessage.classList.add('no-movie');
        noMovieMessage.innerHTML = `<h3>Movie not available</h3>`;
        main.appendChild(noMovieMessage);
        return;
    }
   for (const movie of movies) {
        const { id, poster_path, title, vote_average, overview } = movie;
        if (displayedMovieIds.has(id)) continue;
        displayedMovieIds.add(id);
        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.dataset.id = id; 
        const isInWatchlist = watchlist.some(item => item.id === id);
        movieEl.innerHTML = `
            <img src="${IMGPATH + poster_path}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getClassByRate(vote_average)}">${vote_average} ★</span>
            </div>
            <div class="overview">
                <h4>Overview:</h4>
                <p>${overview}</p>
                <h4>Details:</h4>
                <p>${await getMovieDetails(id)}</p>
                <button class="watchlist-btn">${isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}</button>
                <button class="know-more-btn">Know More</button>
            </div>
        `;
        const watchlistBtn = movieEl.querySelector('.watchlist-btn');
        watchlistBtn.addEventListener("click", () => toggleWatchlist(movie));
        const knowMoreBtn = movieEl.querySelector('.know-more-btn');
        knowMoreBtn.addEventListener("click", () => {
            const query = encodeURIComponent(title + " movie");
            window.open(`https://www.google.com/search?q=${query}`, '_blank');
        });
        main.appendChild(movieEl);
    }
}
async function getMovieDetails(movieId) {
    try {
        const resp = await fetch(`${MOVIEDETAILSAPI}${movieId}?api_key=${apiKey}&append_to_response=credits`);
        if (!resp.ok) throw new Error('Network response was not ok');
        const movieData = await resp.json();
        const runtime = formatRuntime(movieData.runtime);
        const director = movieData.credits.crew.find(crewMember => crewMember.job === 'Director')?.name || 'N/A';
        const actors = movieData.credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
        return `
            <h4>Release Year: ${new Date(movieData.release_date).getFullYear()}</h4>
            <h4>Duration: ${runtime}</h4>
            <h4>Director: ${director}</h4>
            <h4>Actors: ${actors}</h4>
        `;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return `
            <h4>Release Year: N/A</h4>
            <h4>Duration: N/A</h4>
            <h4>Director: N/A</h4>
            <h4>Actors: N/A</h4>
        `;
    }
}
function formatRuntime(runtime) {
    if (runtime === undefined || runtime === null || runtime <= 0) return "Runtime not available"; 
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours}hr ${minutes}min`;
}
function getClassByRate(vote) {
    if (vote >= 8) {
        return 'green';
    } else if (vote >= 5) {
        return 'orange';
    } else {
        return 'red';
    }
}
function toggleWatchlist(movie) {
    const isInWatchlist = watchlist.some(item => item.id === movie.id);
    if (isInWatchlist) {
        watchlist = watchlist.filter(item => item.id !== movie.id);
        alert(`${movie.title} has been removed from your watchlist.`);
    } else {
        watchlist.push(movie);
        alert(`${movie.title} has been added to your watchlist.`);
    }
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    showMovies(Array.from(displayedMovieIds).map(id => ({
        id,
        ...movies.find(movie => movie.id === id)
    })));
    const movieEl = main.querySelector(`.movie[data-id='${movie.id}']`);
    if (movieEl) {
        const watchlistBtn = movieEl.querySelector('.watchlist-btn');
        watchlistBtn.textContent = isInWatchlist ? "Add to Watchlist" : "Remove from Watchlist";
    }
}
function displayWatchlist() {
    main.innerHTML = ""; 
    if (watchlist.length === 0) {
        const noWatchlistMessage = document.createElement('div');
        noWatchlistMessage.classList.add('no-watchlist');
        noWatchlistMessage.innerHTML = `<h3>Your watchlist is empty</h3>`;
        main.appendChild(noWatchlistMessage);
    } else {
        showMovies(watchlist);
    }
    hideSearchForm(); 
    showGoBackButton();
}
function showGoBackButton() {
    goBackBtn.style.display = 'inline';
    goBackBtn.addEventListener("click", () => {
        getMovies(APIURL);
        hideGoBackButton();
        showSearchForm(); 
    });
}
function hideGoBackButton() {
    goBackBtn.style.display = 'none';
}
function hideSearchForm() {
    form.style.display = 'none';
}
function showSearchForm() {
    form.style.display = 'block';
}
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = search.value;

    if (searchTerm) {
        getMovies(SEARCHAPI + searchTerm);
        search.value = "";
        hideGoBackButton();
    }
});
watchlistBtn.addEventListener("click", displayWatchlist);