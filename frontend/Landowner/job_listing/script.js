document.addEventListener('DOMContentLoaded', async function () {
    const datepicker = document.getElementById('datepicker');

    // Set the default value of the date picker to the current date
    const today = new Date().toISOString().split('T')[0];
    datepicker.value = today; // Set default to current date
    datepicker.setAttribute('min', today);  // Prevent past dates

    // Fetch jobs for the current date when the page loads
    fetchJobs(today);

    // Ensure date picker allows selecting another date
    datepicker.addEventListener('change', function () {
        const selectedDate = datepicker.value;
        fetchJobs(selectedDate); // Fetch jobs for the selected date
    });

    const labourList = document.querySelector('.labour-list');

    // Function to create and display job cards dynamically
    function createJobCard(job) {
        const jobCard = document.createElement('div');
        jobCard.classList.add('labour-card');

        jobCard.innerHTML = `
            <div class="circle-stars-group">
                <div class="circle"></div>
                <div class="stars">
                    <span class="star">&#9733;</span>
                    <span class="star">&#9733;</span>
                    <span class="star">&#9733;</span>
                    <span class="star">&#9733;</span>
                    <span class="star">&#9733;</span>
                </div>
            </div>
            <div class="labour-info">
                <p><strong>Title:</strong> ${job.title}</p>
                <p><strong>Description:</strong> ${job.description}</p>
                <p><strong>Amount:</strong> ₹${job.amount}</p>
                <p><strong>Start Date:</strong> ${new Date(job.start_date).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> ${new Date(job.end_date).toLocaleDateString()}</p>
            </div>
            <div class="location">
                <p><strong>Location:</strong> ${job.taluk}, ${job.city}</p>
                <button class="request-btn" data-job-id="${job._id}">REQUEST</button>
            </div>
        `;

        labourList.appendChild(jobCard);
    }

    // Fetch jobs from the server
    async function fetchJobs(selectedDate) {
        try {
            const token = getToken(); 
            if (!token) {
                showAuthPopup(); // Show login/signup popup if not logged in
                return;
            }

            let url = 'http://localhost:3000/landowner/available_jobs';
            if (selectedDate) {
                url += `?selectedDate=${selectedDate}`; // Append the selected date to the URL as a query parameter
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header
                    'Content-Type': 'application/json'
                }});
            
            
            const result = await response.json();
            labourList.innerHTML = ''; // Clear previous jobs

            if (result.success && result.data.length > 0) {
                result.data.forEach(job => {
                    createJobCard(job);
                });
                addRequestButtonEventListeners();
            } else {
                labourList.innerHTML = '<p>No jobs available for the selected date</p>';
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            labourList.innerHTML = '<p>Error fetching jobs</p>';
        }
    }

    // Add event listeners to request buttons
    function addRequestButtonEventListeners() {
        const requestButtons = document.querySelectorAll('.request-btn');
        requestButtons.forEach(button => {
            button.addEventListener('click', function () {
                const jobId = button.getAttribute('data-job-id');
                openModal(jobId);
            });
        });
    }
});


    // Additional functions for authentication and job request handling (same as before)
    // ...

// Show authentication popup with overlay
function showAuthPopup() {
    // Create the overlay
    const overlay = document.createElement('div');
    overlay.classList.add('auth-overlay'); // Styled in CSS

    // Create the popup
    const popup = document.createElement('div');
    popup.classList.add('auth-popup'); // Styled in CSS

    // Message above buttons
    const authMessage = document.createElement('p');
    authMessage.innerText = 'Need to sign in or sign up?';
    popup.appendChild(authMessage);

    // Create container for the buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container'); // Styled in CSS for flexbox layout

    // Create login button
    const loginBtn = document.createElement('button');
    loginBtn.innerText = 'Login';
    loginBtn.onclick = function () {
        window.location.href = '../signin/index.html'; // Redirect to login page
        removeAuthPopup(); // Remove popup on navigation
    };

    // Create signup button
    const signupBtn = document.createElement('button');
    signupBtn.innerText = 'Sign Up';
    signupBtn.onclick = function () {
        window.location.href = '../SignUp_Page/index.html'; // Redirect to signup page
        removeAuthPopup(); // Remove popup on navigation
    };

    // Append buttons to the container
    buttonContainer.appendChild(loginBtn);
    buttonContainer.appendChild(signupBtn);

    // Add the button container to the popup
    popup.appendChild(buttonContainer);

    // Append the overlay and popup to the body
    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    // Close popup when clicking outside or pressing Escape
    overlay.addEventListener('click', removeAuthPopup);
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            removeAuthPopup();
        }
    });
}

// Remove the authentication popup and overlay
function removeAuthPopup() {
    const overlay = document.querySelector('.auth-overlay');
    const popup = document.querySelector('.auth-popup');
    if (overlay) overlay.remove();
    if (popup) popup.remove();
}

// Logout user
function logoutUser() {
    // Clear the JWT token from localStorage
    localStorage.removeItem('jwt');

    // Remove the popup and overlay (if they exist)
    removeAuthPopup();

    // Redirect to the desired page after logging out
    window.location.href = 'http://localhost:5500/frontend/static/home_page/index.html'; // Change to your logout redirect page
}

// Check authentication status and show popup or logout button
async function checkAuthStatus() {
    const token = getToken();
    const authBtnContainer = document.getElementById('auth-btn-container');

    if (token) {
        // If the user is logged in, show the Logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.innerText = 'Logout';
        logoutBtn.classList.add('logout-btn'); // You can style this in CSS
        logoutBtn.onclick = logoutUser;
        authBtnContainer.appendChild(logoutBtn);
    } else {
        // If the user is not logged in, show the login/signup popup
        showAuthPopup();
    }
}

// Get JWT token from localStorage
function getToken() {
    return localStorage.getItem('jwt');  // Retrieve JWT token from localStorage
}

// Fetch jobs on page load and check authentication
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
})

