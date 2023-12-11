"use strict";
(() => {

    // Event listener for when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        // Inject modal HTML into the page
        injectModals();
        // Set up triggers for modals
        setupModalTriggers();
        // Fetch and display movies from a JSON file
        fetchMovies();
        // Add event listeners for modals and buttons
        setupAddMovieModalListener();
        setupEditMovieModalListener();
        setupDeleteButtonListener();
    });

// Injects the modal HTML into the DOM
    function injectModals() {
        // Get the placeholder div for modals
        const modalPlaceholder = document.getElementById('modal-placeholder');
        // Set its inner HTML to include the modal structures for Add and Edit movies
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
                <div class="modal-body login-box">
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
                        <button type="submit" class="">Save Changes</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
`;
    }

// Sets up the triggers that will show the modals when buttons are clicked
    function setupModalTriggers() {
        // Show the Add Movie Modal when the corresponding button is clicked
        document.getElementById('show-add-modal').addEventListener('click', () => {
            new bootstrap.Modal(document.getElementById('addMovieModal')).show();
        });
    }

// Fetches the list of movies from the movies.JSON file
    function fetchMovies() {
        // Show a loading message while fetching
        const loadingMessage = document.getElementById('loading-message');
        // Get the movies list container in the DOM
        const moviesList = document.getElementById('movies-list');
        // Fetch the JSON data and then display each movie as a card
        // using the createMovieElement function
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
                            const movieElement = createMovieElement(movie, 'img/coming-soon-design-template.jpeg');
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

// Fetches the poster image from the TMDB API
    function fetchMoviePoster(title) {
        // API URL with the movie title query
        const TMDB_SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}`;

        // Fetch data from TMDB and return the poster URL or a default image
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
                    // Return path to default image
                    return 'img/coming-soon-design-template.jpeg';
                }
            })
            .catch(error => {
                console.error('Error fetching poster:', error);
                return 'img/coming-soon-design-template.jpeg';
            });
    }

// Creates a movie card element with the provided movie data and poster URL
    function createMovieElement(movie, posterUrl) {
        // Create a new div for the movie card and set its content
        const movieElement = document.createElement('div');
        // Set classes and inner HTML, including the movie poster, title, and rating
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


// Sets up listener for the Add Movie form submission
    function setupAddMovieModalListener() {
        const addForm = document.getElementById('add-movie-form');
        // On submit, prevent the default form submission and add the new movie
        // to the list, then reset the form and hide the modal
        if (addForm) {
            addForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const movieTitle = document.getElementById('modal-movie-title').value;
                const movieRating = document.getElementById('modal-movie-rating').value;

                const newMovie = {
                    title: movieTitle,
                    rating: movieRating
                };

                fetch('http://localhost:3000/movies', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
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
                                const movieElement = createMovieElement(data, 'img/coming-soon-design-template.jpeg');
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
        moviesList.addEventListener('click', function (event) {
            if (event.target.classList.contains('edit-btn')) {
                event.preventDefault();

                let movieId = event.target.getAttribute('data-movie-id');

                // Fetch the movie data from your JSON data
                fetch('data/movies.json')
                    .then(response => response.json())
                    .then(data => {
                        let movie = data.movies.find(m => m.id == movieId);
                        if (movie) {
                            document.getElementById('edit-movie-id').value = movie.id;
                            document.getElementById('edit-movie-title').value = movie.title;
                            document.getElementById('edit-movie-rating').value = movie.rating;
                        } else {
                            console.error('Movie not found');
                        }
                    })
                    .catch(error => console.error('Error fetching movie data:', error));

                let editModal = new bootstrap.Modal(document.getElementById('editMovieModal'));
                editModal.show();
            }
        });

        let editForm = document.getElementById('edit-movie-form');
        if (editForm) {
            editForm.addEventListener('submit', function (event) {
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

// Sets up listener for clicks on the Delete button in movie cards
    function setupDeleteButtonListener() {
        const moviesList = document.getElementById('movies-list');
        moviesList.addEventListener('click', function (event) {
            if (event.target.classList.contains('delete-btn')) {
                const movieId = event.target.getAttribute('data-movie-id');
                deleteMovie(movieId);
            }
        });
    }

// Deletes a movie from the list and updates the DOM
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

// Updates a movie's data in the movies.JSON file and on the DOM
    function updateMovieInJSON(movieId, updatedMovie) {
        fetch(`http://localhost:3000/movies/${movieId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
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

// Updates the movie card on the DOM with the new data
    function updateMovieOnDOM(updatedMovie, posterUrl) {
        const movieCard = document.getElementById(`movie-card-${updatedMovie.id}`);
        if (movieCard) {
            movieCard.querySelector('.card-title').textContent = updatedMovie.title;
            movieCard.querySelector('.card-text').textContent = `${'★'.repeat(Math.floor(updatedMovie.rating))}${'☆'.repeat(5 - Math.floor(updatedMovie.rating))}`;

            const posterImage = movieCard.querySelector('.card-img-top');
            posterImage.src = posterUrl;
            posterImage.alt = updatedMovie.title; //
        } else {
            console.error(`Movie card with ID movie-card-${updatedMovie.id} not found.`);
        }
    }

// Updates the movie poster on the DOM
    function updateMoviePosterOnDOM(movieId, posterUrl) {
        // Find the movie card element by movie ID
        const movieCard = document.getElementById(`movie-card-${movieId}`);
        if (movieCard) {

            const posterImage = movieCard.querySelector('.card-img-top');

            posterImage.src = posterUrl;

            posterImage.alt = `Poster of the movie ${movieCard.querySelector('.card-title').textContent}`;
        } else {
            console.error(`Movie card with ID movie-card-${movieId} not found.`);
        }
    }

})();
