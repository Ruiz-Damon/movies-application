"use strict";
(() => {

document.addEventListener('DOMContentLoaded', () => {
    injectModals();
    setupModalTriggers();
    fetchMovies();
    setupAddMovieModalListener();
    setupEditMovieModalListener();
    setupDeleteButtonListener();
});

function injectModals() {
    const modalPlaceholder = document.getElementById('modal-placeholder');
    modalPlaceholder.innerHTML = `
    <!-- Add Movie Modal -->
    <div class="modal fade" id="addMovieModal" tabindex="-1" aria-labelledby="addMovieModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
               <div class="modal-header">
                    <h5 class="modal-title" id="addMovieModalLabel">Add New Movie</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body login-box">
                    <form id="add-movie-form">
                        <div class="mb-3">
                            <label for="modal-movie-title" class="form-label">Title</label>
                            <input type="text" class="form-control" id="modal-movie-title" required>
                        </div>
                        <div class="mb-3">
                            <label for="modal-movie-rating" class="form-label">Rating</label>
                            <input type="number" class="form-control" id="modal-movie-rating" min="1" max="5" required>
                        </div>
                        <button type="submit" class=""><span></span><span></span><span></span><span></span> Add Movie</input>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Movie Modal -->
    <div class="modal fade" id="editMovieModal" tabindex="-1" aria-labelledby="editMovieModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editMovieModalLabel">Edit Movie</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="edit-movie-form">
                        <input type="hidden" id="edit-movie-id">
                        <div class="mb-3">
                            <label for="edit-movie-title" class="form-label">Title</label>
                            <input type="text" class="form-control" id="edit-movie-title" required>
                        </div>
                        <div class="mb-3">
                            <label for="edit-movie-rating" class="form-label">Rating</label>
                            <input type="number" class="form-control" id="edit-movie-rating" min="1" max="5" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
`;
}

function setupModalTriggers() {
    document.getElementById('show-add-modal').addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('addMovieModal')).show();
    });
}

function fetchMovies() {
    const loadingMessage = document.getElementById('loading-message');
    const moviesList = document.getElementById('movies-list');
    loadingMessage.style.display = 'block';

    fetch('data/movies.json')
        .then(response => response.json())
        .then(data => {
            loadingMessage.style.display = 'none';
            moviesList.innerHTML = '';
            data.movies.forEach(movie => {
                fetchMoviePoster(movie.title)
                    .then(posterUrl => {
                        const movieElement = createMovieElement(movie, posterUrl);
                        moviesList.appendChild(movieElement);
                    })
                    .catch(() => {
                        const movieElement = createMovieElement(movie, 'path_to_default_image.jpg');
                        moviesList.appendChild(movieElement);
                    });
            });
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
            loadingMessage.textContent = 'Failed to load movies.';
            loadingMessage.style.display = 'none';
        });
}

function fetchMoviePoster(title) {
    const TMDB_SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}`;

    return fetch(TMDB_SEARCH_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok (${response.status} ${response.statusText})`);
            }
            return response.json();
        })
        .then(data => {
            if (data.results.length > 0 && data.results[0].poster_path) {
                const posterPath = data.results[0].poster_path;
                return `https://image.tmdb.org/t/p/w500${posterPath}`;
            } else {
                throw new Error('Poster not found');
            }
        })
        .catch(error => {
            console.error('Error fetching poster:', error);
            throw error; // Rethrow the error to propagate it
        });
}


function createMovieElement(movie, posterUrl) {
    const movieElement = document.createElement('div');
    movieElement.className = 'col-12 col-md-4 col-lg-3 mb-3';
    movieElement.id = `movie-card-${movie.id}`;
    movieElement.innerHTML = `
    <div class="card h-100" id="card-style">
        <img src="${posterUrl}" class="card-img-top" alt="${movie.title}">
        <div class="card-bottom">
            <div class="card-top">
                <h5 class="card-title">${movie.title}</h5>
                <div class="dropdown">
                    <button class="dropbtn"><i class="fas fa-bars"></i></button>
                    <div class="dropdown-content">
                        <a href="#" class="edit-btn" data-movie-id="${movie.id}">Edit Movie</a>
                        <a href="#" class="delete-btn" data-movie-id="${movie.id}">Delete</a>
                    </div>
                </div>
            </div>
            <p class="card-text">${'★'.repeat(Math.floor(movie.rating))}${'☆'.repeat(5 - Math.floor(movie.rating))}</p>
        </div>
    </div>
    `;
    return movieElement;
}







function setupAddMovieModalListener() {
    const addForm = document.getElementById('add-movie-form');
    if (addForm) {
        addForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const movieTitle = document.getElementById('modal-movie-title').value;
            const movieRating = document.getElementById('modal-movie-rating').value;

            const newMovie = {
                title: movieTitle,
                rating: movieRating
            };

            fetch('http://localhost:3000/movies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMovie)
            })
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    console.log('Server Response:', data);

                    fetchMoviePoster(data.title)
                        .then(posterUrl => {
                            const movieElement = createMovieElement(data, posterUrl);
                            document.getElementById('movies-list').appendChild(movieElement);
                        })
                        .catch(() => {
                            const movieElement = createMovieElement(data, 'path_to_default_image.jpg');
                            document.getElementById('movies-list').appendChild(movieElement);
                        });
                    addForm.reset();
                    bootstrap.Modal.getInstance(document.getElementById('addMovieModal')).hide();
                })
                .catch(error => console.error('Error adding new movie:', error));
        });
    } else {
        console.error('Add movie form not found');
    }
}

function setupEditMovieModalListener() {
    const moviesList = document.getElementById('movies-list');
    moviesList.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-btn')) {
            event.preventDefault();

            let movieId = event.target.getAttribute('data-movie-id');
            let movieElement = document.getElementById(`movie-card-${movieId}`);
            let movieTitle = movieElement.querySelector('.card-title').textContent;
            let movieRating = parseFloat(movieElement.querySelector('.card-text').textContent.replace(/[^0-9.]/g, ''));

            document.getElementById('edit-movie-id').value = movieId;
            document.getElementById('edit-movie-title').value = movieTitle;
            document.getElementById('edit-movie-rating').value = movieRating;

            let editModal = new bootstrap.Modal(document.getElementById('editMovieModal'));
            editModal.show();
        }
    });

    let editForm = document.getElementById('edit-movie-form');
    if (editForm) {
        editForm.addEventListener('submit', function(event) {
            event.preventDefault();
            let movieId = document.getElementById('edit-movie-id').value;
            let updatedTitle = document.getElementById('edit-movie-title').value;
            let updatedRating = document.getElementById('edit-movie-rating').value;

            let updatedMovie = {
                title: updatedTitle,
                rating: parseFloat(updatedRating)
            };

            updateMovieInJSON(movieId, updatedMovie);
        });
    }
}


function setupDeleteButtonListener() {
    const moviesList = document.getElementById('movies-list');
    moviesList.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-btn')) {
            const movieId = event.target.getAttribute('data-movie-id');
            deleteMovie(movieId);
        }
    });
}



function deleteMovie(movieId) {
    if (confirm('Are you sure you want to delete this movie?')) {
        fetch(`http://localhost:3000/movies/${movieId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error deleting movie');
                }
                return response.json();
            })
            .then(() => {
                // Remove the movie element from the DOM
                const movieElement = document.getElementById(`movie-card-${movieId}`);
                if (movieElement) {
                    movieElement.remove();
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}


function updateMovieInJSON(movieId, updatedMovie) {
    fetch(`http://localhost:3000/movies/${movieId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMovie),
    })
        .then(response => {
            if (!response.ok) throw new Error('Error updating movie');
            return response.json();
        })
        .then(updatedMovie => {
            // Update the movie on the DOM
            updateMovieOnDOM(updatedMovie);

            // Fetch the new poster for the updated title
            fetchMoviePoster(updatedMovie.title)
                .then(posterUrl => {
                    // Update the poster image on the DOM if posterUrl is defined
                    if (posterUrl) {
                        updateMoviePosterOnDOM(movieId, posterUrl);
                    } else {
                        console.error('Poster URL is undefined for movie:', updatedMovie.title);
                    }
                })
                .catch(error => {
                    console.error('Error fetching new poster:', error);
                });

            // Close the edit modal
            bootstrap.Modal.getInstance(document.getElementById('editMovieModal')).hide();
        })
        .catch(error => console.error('Error:', error));
}

function updateMovieOnDOM(updatedMovie, posterUrl) {
    const movieCard = document.getElementById(`movie-card-${updatedMovie.id}`);
    if (movieCard) {
        movieCard.querySelector('.card-title').textContent = updatedMovie.title;
        movieCard.querySelector('.card-text').textContent = `Rating: ${'★'.repeat(Math.floor(updatedMovie.rating))}${'☆'.repeat(5 - Math.floor(updatedMovie.rating))}`;

        const posterImage = movieCard.querySelector('.card-img-top');
        posterImage.src = posterUrl;
        posterImage.alt = updatedMovie.title; // Use updatedMovie.title for alt attribute
    } else {
        console.error(`Movie card with ID movie-card-${updatedMovie.id} not found.`);
    }
}

function updateMoviePosterOnDOM(movieId, posterUrl) {
    // Find the movie card element by movie ID
    const movieCard = document.getElementById(`movie-card-${movieId}`);
    if (movieCard) {
        // Select the poster image within the movie card
        const posterImage = movieCard.querySelector('.card-img-top');
        // Update the poster image's src attribute to the new URL
        posterImage.src = posterUrl;
        // Optionally update the alt attribute as well
        posterImage.alt = `Poster of the movie ${movieCard.querySelector('.card-title').textContent}`;
    } else {
        console.error(`Movie card with ID movie-card-${movieId} not found.`);
    }
}

    function sortMoviesByTitle(moviesArray) {
        return moviesArray.sort((a, b) => a.title.localeCompare(b.title));
    }

    function sortMoviesByRating(moviesArray) {
        // Assuming higher ratings should come first
        return moviesArray.sort((a, b) => b.rating - a.rating);
    }

    function sortAndDisplayMovies(sortType) {
        const moviesListElement = document.getElementById('movies-list');
        let sortedMovies;

        if (sortType === 'title') {
            sortedMovies = sortMoviesByTitle(movies);
        } else if (sortType === 'rating') {
            sortedMovies = sortMoviesByRating(movies);
        }

        // Clear current movies
        moviesListElement.innerHTML = '';

        // Add sorted movies
        sortedMovies.forEach(movie => {
            const movieElement = createMovieElement(movie, movie.posterUrl);
            moviesListElement.appendChild(movieElement);
        });
    }


    document.getElementById('sort').addEventListener('change', function(event) {
        sortAndDisplayMovies(event.target.value);
    });


})();
