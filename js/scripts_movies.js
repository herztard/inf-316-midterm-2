const apiKey = '3fe664b8b79dfbf62b861479453a302d';
const baseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
let currentMovies = [];
let watchlist = JSON.parse(localStorage.getItem('watchlist'));


async function searchMovies() {
    const query = document.getElementById('movie-search').value;
    const sortBy = document.getElementById('sort-select').value;
    const url = `${baseUrl}/search/movie?api_key=${apiKey}&query=${query}&sort_by=${sortBy}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        currentMovies = data.results;
        displayMovies(currentMovies);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayMovies(movies) {
    const moviesGrid = document.getElementById('movies-grid');
    moviesGrid.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.style.height = "400px"
        movieCard.innerHTML = `
            <img src="${imageBaseUrl}${movie.poster_path}" alt="${movie.title}">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-release"> ${movie.release_date}</div>
            </div>
        `;
        movieCard.onclick = () => showMovieDetails(movie.id);
        moviesGrid.appendChild(movieCard);
    });
}

async function showMovieDetails(movieId) {
    const url = `${baseUrl}/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,videos`;

    try {
        const response = await fetch(url);
        const movie = await response.json();

        const modalContent = document.querySelector('.modal-content');
        modalContent.innerHTML = `
            <span class="close">&times;</span>
            <h2>${movie.title}</h2>
            <img src="${imageBaseUrl}${movie.poster_path}" alt="${movie.title}" style="width: 200px; margin-right: 20px;">
            <p>${movie.overview}</p>
            <p>Rating: ${movie.vote_average}/10</p>
            <p>Runtime: ${movie.runtime} minutes</p>
            <p>Cast: ${movie.credits.cast.slice(0, 5).map(actor => actor.name).join(', ')}</p>
            ${movie.videos.results.length > 0 ? `
                <h3>Trailer</h3>
                <iframe width="100%" height="auto" style="max-width: 560px; aspect-ratio: 16/9; margin-bottom: 36px;" src="https://www.youtube.com/embed/${movie.videos.results[0].key}" frameborder="0" allowfullscreen></iframe>
            ` : ''}
            <button id="add-to-watchlist" onclick="addToWatchlist(${movie.id})">Add to Watchlist</button>
        `;

        document.getElementById('movie-modal').style.display = 'block';

        document.querySelector('.close').onclick = () => {
            document.getElementById('movie-modal').style.display = 'none';
        };

        const toggleWatchlistButton = document.getElementById('add-to-watchlist');
        updateToggleButtonState(toggleWatchlistButton, movieId);

        toggleWatchlistButton.onclick = () => {
            toggleWatchlist(movieId);
            updateToggleButtonState(toggleWatchlistButton, movieId);
        };
    } catch (error) {
        console.error('Error:', error);
    }
}

function toggleWatchlist(movieId) {
    if (watchlist.includes(movieId)) {
        removeFromWatchlist(movieId);
    } else {
        addToWatchlist(movieId);
    }
}

function updateToggleButtonState(button, movieId) {
    if (watchlist.includes(movieId)) {
        button.textContent = 'Remove from Watchlist';
        button.classList.add('remove');
        button.classList.remove('add');
    } else {
        button.textContent = 'Add to Watchlist';
        button.classList.add('add');
        button.classList.remove('remove');
    }
}

function sortMovies() {
    const sortBy = document.getElementById('sort-select').value;
    currentMovies.sort((a, b) => {
        if (sortBy === 'release_date.desc') {
            return new Date(b.release_date) - new Date(a.release_date);
        } else if (sortBy === 'vote_average.desc') {
            return b.vote_average - a.vote_average;
        } else {
            return b.popularity - a.popularity;
        }
    });
    displayMovies(currentMovies);
}

function addToWatchlist(movieId) {
    if (!watchlist.includes(movieId)) {
        watchlist.push(movieId);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        updateWatchlist();
    }
}

async function updateWatchlist() {
    const watchlistContainer = document.getElementById('watchlist');
    watchlistContainer.innerHTML = '';

    for (const movieId of watchlist) {
        const url = `${baseUrl}/movie/${movieId}?api_key=${apiKey}`;
        try {
            const response = await fetch(url);
            const movie = await response.json();
            const movieElement = document.createElement('div');

            movieElement.style.height = '150px';
            movieElement.style.overflow = 'hidden';
            movieElement.style.margin = '10px 0';

            movieElement.innerHTML = `
                <img src="${imageBaseUrl}${movie.poster_path}" alt="${movie.title}" style="width: 100px; float: left; margin-right: 10px;">
                <h3>${movie.title}</h3>
                <button onclick="removeFromWatchlist(${movie.id})">Remove</button>
            `;
            watchlistContainer.appendChild(movieElement);
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

function removeFromWatchlist(movieId) {
    watchlist = watchlist.filter(id => id !== movieId);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    updateWatchlist();
}

updateWatchlist();