document.addEventListener('DOMContentLoaded', async function () {
    // Fetch jobs for the current date when the page loads
    const datepicker = document.getElementById('datepicker');

    // Set the default value of the date picker to today's date
    const today = new Date().toISOString().split('T')[0];
    datepicker.value = today; // Set the default date picker value to today
    datepicker.setAttribute('min', today); // Prevent past dates from being selected

    checkAuthStatus(); // Check if the user is logged in
    fetchJobs(today); // Fetch jobs for today's date when page loads

    // Add change event listener to date picker to fetch jobs for the selected date
    datepicker.addEventListener('change', function () {
        const selectedDate = datepicker.value;
        fetchJobs(selectedDate); // Fetch jobs for the newly selected date
    });

    // Function to fetch jobs from the server based on the selected date
    async function fetchJobs(selectedDate) {
        try {
            const token = getToken(); // Get JWT token
            if (!token) {
                showAuthPopup(); // Show login/signup popup if not logged in
                return;
            }

            // Construct the API URL with the selected date as a query parameter
            let url = 'http://localhost:3000/landowner/available_jobs';
            if (selectedDate) {
                url += `?selectedDate=${selectedDate}`; // Append selected date to the URL
            }
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Add JWT to Authorization header
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
            
                // Check for 404 and redirect to 404 page if necessary
                if (response.status === 404) {
                    window.location.href = '../404/index.html'; // Adjust the path to your 404 page
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
           
            if (data.success) {
                displayJobs(data.data); // Display jobs based on the selected date
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    }

    // Function to dynamically display jobs in the modal (existing code)
    function displayJobs(jobs) {
        const jobListContainer = document.getElementById('job-list-container');
        jobListContainer.innerHTML = ''; // Clear any existing job cards

        if (jobs.length === 0) {
            // Display a "No jobs available" message if the jobs array is empty
            const noJobsMessage = document.createElement('p');
            noJobsMessage.classList.add('no-jobs-message'); // Add a CSS class for styling
            noJobsMessage.innerText = 'No jobs available for the selected date.';
            jobListContainer.appendChild(noJobsMessage);
            return; // Exit the function early as there are no jobs to display
        }
    
        jobs.forEach(job => {
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
            jobListContainer.appendChild(jobCard);
        });

        // Add click event listeners to all request buttons after rendering jobs
        const requestButtons = document.querySelectorAll('.request-btn');
        requestButtons.forEach(button => {
            button.addEventListener('click', function () {
                const jobId = this.dataset.jobId;
                openModal(jobId); // Open modal and pass the jobId
            });
        });
    }

    // Other existing code (Modal handling, OTP, registration, etc.)...

    // Show authentication popup with overlay (existing code)
    function showAuthPopup() {
        // Create the overlay and popup for authentication
        const overlay = document.createElement('div');
        overlay.classList.add('auth-overlay'); // Styled in CSS

        const popup = document.createElement('div');
        popup.classList.add('auth-popup'); // Styled in CSS

        const authMessage = document.createElement('p');
        authMessage.innerText = 'Need to sign in or sign up?';
        popup.appendChild(authMessage);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container'); // Styled in CSS

        const loginBtn = document.createElement('button');
        loginBtn.innerText = 'Login';
        loginBtn.onclick = function () {
            window.location.href = '../signin/index.html';
            removeAuthPopup(); // Remove popup on navigation
        };

        const signupBtn = document.createElement('button');
        signupBtn.innerText = 'Sign Up';
        signupBtn.onclick = function () {
            window.location.href = '../SignUp_Page/index.html';
            removeAuthPopup(); // Remove popup on navigation
        };

        buttonContainer.appendChild(loginBtn);
        buttonContainer.appendChild(signupBtn);
        popup.appendChild(buttonContainer);

        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        // Close popup when clicking outside or pressing Escape
        overlay.addEventListener('click', removeAuthPopup);
        document.addEventListener('keydown', function (event) {
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
})
// Get JWT token from localStorage
function getToken() {
    return localStorage.getItem('jwt');  // Retrieve JWT token from localStorage
}

