document.addEventListener('DOMContentLoaded', () => {
    injectModals(); // First call to ensure modals are in DOM
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
                    <div class="modal-body">
                        <form id="add-movie-form">
                            <div class="mb-3">
                                <label for="modal-movie-title" class="form-label">Title</label>
                                <input type="text" class="form-control" id="modal-movie-title" required>
                            </div>
                            <div class="mb-3">
                                <label for="modal-movie-rating" class="form-label">Rating</label>
                                <input type="number" class="form-control" id="modal-movie-rating" min="1" max="5" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Add Movie</button>
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
    setupModalTriggers();
    fetchMovies();
    setupAddMovieModalListener();
    setupEditMovieModalListener();
}

function setupModalTriggers() {
    // Set up the trigger for the Add Movie Modal
    document.getElementById('show-add-modal').addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('addMovieModal')).show();
    });
}

function fetchMovies() {
    const loadingMessage = document.getElementById('loading-message');
    const moviesList = document.getElementById('movies-list');
    const TMDB_API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=1`;

    loadingMessage.style.display = 'block'; // Show loading message

    fetch(TMDB_API_URL)
        .then(response => response.json())
        .then(data => {
            loadingMessage.style.display = 'none'; // Hide loading message
            moviesList.innerHTML = ''; // Clear the movie list
            data.results.forEach(movie => {
                const movieElement = createMovieElement(movie);
                moviesList.appendChild(movieElement);
            });
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
            loadingMessage.textContent = 'Failed to load movies.';
            loadingMessage.style.display = 'none';
        });
}

function createMovieElement(movie) {
    const movieElement = document.createElement('div');
    movieElement.className = 'col-12 col-md-4 col-lg-3 mb-3';
    const movieImageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    const movieRating = movie.vote_average / 2; // Adjust TMDB rating to a 5-star scale
    movieElement.innerHTML = `
        <div class="card h-100">
            <img src="${movieImageUrl}" class="card-img-top" alt="${movie.title}">
            <div class="card-body">
                <h5 class="card-title">${movie.title}</h5>
                <p class="card-text">${'★'.repeat(Math.floor(movieRating))}${'☆'.repeat(5 - Math.floor(movieRating))}</p>
                <button type="button" class="btn btn-primary edit-btn" data-movie-id="${movie.id}">Edit</button>
                <button type="button" class="btn btn-danger delete-btn" data-movie-id="${movie.id}">Delete</button>
            </div>
        </div>
    `;
    return movieElement;
}


// Call fetchMovies when DOM is fully loaded
document.addEventListener('DOMContentLoaded', fetchMovies);

// Set up the listener for the Add Movie form
function setupAddMovieModalListener() {
    // We need to ensure this function is called after the modals have been injected
    const addForm = document.getElementById('add-movie-form');
    if (addForm) {
        addForm.addEventListener('submit', function(event) {
            // ... (add movie form submission logic)
        });
    } else {
        console.error('Add movie form not found');
    }
}

// Set up the listener for the Edit Movie form
function setupEditMovieModalListener() {
    // Use event delegation to handle dynamically added edit buttons
    const moviesList = document.getElementById('movies-list');
    moviesList.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-btn')) {
            const movieId = event.target.getAttribute('data-movie-id');
            fetch(`http://localhost:3000/movies/${movieId}`)
                .then(response => response.json())
                .then(movie => {
                    document.getElementById('edit-movie-id').value = movie.id;
                    document.getElementById('edit-movie-title').value = movie.title;
                    document.getElementById('edit-movie-rating').value = movie.rating;
                    // Using bootstrap.Modal.getOrCreateInstance to handle cases where the modal instance might already exist
                    const editModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editMovieModal'));
                    editModal.show();
                })
                .catch(error => {
                    console.error('Error fetching movie details:', error);
                });
        }
    });

    // Setup the edit form submission event listener here as well
    const editForm = document.getElementById('edit-movie-form');
    if (editForm) {
        editForm.addEventListener('submit', function(event) {
            // ... (edit form submission logic)
        });
    } else {
        console.error('Edit movie form not found');
    }
}

function deleteMovie(movieId) {
    const deleteButton = document.querySelector(`#movie-card-${movieId} .delete-btn`);
    if (confirm('Are you sure you want to delete this movie?')) {
        deleteButton.disabled = true;
        fetch(`http://localhost:3000/movies/${movieId}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) throw new Error('Error deleting movie');
                const movieElement = document.getElementById(`movie-card-${movieId}`).parentElement;
                movieElement.remove();
            })
            .catch(error => console.error('Error:', error))
            .finally(() => deleteButton.disabled = false);
    }
}

function updateMovieOnDOM(updatedMovie) {
    const movieCard = document.getElementById(`movie-card-${updatedMovie.id}`);
    movieCard.querySelector('.card-title').textContent = updatedMovie.title;
    movieCard.querySelector('.card-text').textContent = `Rating: ${updatedMovie.rating}`;
}
