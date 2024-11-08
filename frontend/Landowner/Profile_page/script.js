// Feather icons replacement for any icons you might use
feather.replace();

// When DOM is loaded, check auth status and fetch profile/job data
document.addEventListener('DOMContentLoaded', async function () {
    await checkAuthStatus();
    await fetchProfileData();
    await fetchJobData();
});

// Format Date utility
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = String(date.getFullYear()).slice(-4); // Full year
    return `${day}/${month}/${year}`;
}

// Fetch and display profile data
async function fetchProfileData() {
    try {
        const token = getToken();
        console.log('Token:', token);

        const response = await fetch('http://localhost:3000/landowner/view_profile', {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`, // Add JWT to Authorization header
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('Profile Data:', data);

        const number_of_jobs_posted = data.job_history ? data.job_history.length : 0;

        document.getElementById('no-of-posts').innerText = number_of_jobs_posted;
        document.getElementById('nameDisplay1').innerText = data.username;
        document.getElementById('nameDisplay2').innerText = data.username;
        document.getElementById('genderDisplay').innerText = data.gender;
        document.getElementById('DOBDisplay').innerText = data.DOB;
        document.getElementById('phoneDisplay').innerText = data.mobile_number;
        document.getElementById('alt-phoneDisplay').innerText = data.alternate_mobile_number;
        document.getElementById('aadhaarDisplay').innerText = data.aadhaar_ID;
        document.getElementById('emailDisplay').innerText = data.email;
        document.getElementById('addressDisplay').innerText = data.address;
        document.getElementById('land_locationDisplay').innerText = data.land_location;
        document.getElementById('land_sizeDisplay').innerText = data.land_size;
        document.getElementById('land_typeDisplay').innerText = data.land_type;
        document.getElementById('stateDisplay').innerText = data.state;
        document.getElementById('cityDisplay').innerText = data.city;
        document.getElementById('talukDisplay').innerText = data.taluk;
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
}

// Fetch job history and display dynamically
// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Fetch job history and display dynamically, separating completed and future jobs
async function fetchJobData() {
    try {
        const token = getToken();
        const response = await fetch('http://localhost:3000/landowner/get_job_history', {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`, // Add JWT to Authorization header
                'Content-Type': 'application/json',
            },
        });

        const jobs = await response.json();
        console.log('Job Data:', jobs);

        // Get the current date to compare with job dates
        const currentDate = new Date();

        // Separate jobs into completed and future
        const completedJobs = jobs.filter(job => new Date(job.end_date) < currentDate);
        const futureJobs = jobs.filter(job => new Date(job.start_date) > currentDate);

        // Container for displaying jobs
        const jobContainer = document.querySelector('.job-created-section');
        jobContainer.innerHTML = '<h2>Jobs Created:</h2>';

        // Create sections for completed and future jobs
        const completedJobsContainer = document.createElement('div');
        const futureJobsContainer = document.createElement('div');

        completedJobsContainer.innerHTML = '<h3>Completed Jobs:</h3>';
        futureJobsContainer.innerHTML = '<h3>Future Jobs:</h3>';

        // Function to render jobs in a container
        function displayJobs(jobs, container) {
            if (jobs.length === 0) {
                container.innerHTML += '<p>No jobs available in this category.</p>';
                return;
            }

            jobs.forEach((job) => {
                const jobElement = document.createElement('div');
                jobElement.classList.add('job-container');

                jobElement.innerHTML = `
                    <div class="job-summary" onclick="toggleJobDetails(this)">
                        <div class="job-header">
                            <p><strong>Job Title:</strong> ${job.title}</p>
                            <p><strong>Start Date:</strong> ${formatDate(job.start_date)}</p>
                            <p><strong>End Date:</strong> ${formatDate(job.end_date)}</p>
                            <span class="arrow">▼</span>
                        </div>
                    </div>
                    <div class="job-details" style="display: none;">
                        <p><strong>Job Description:</strong> ${job.description}</p>
                        <p><strong>Job Location:</strong> ${job.location}</p>
                        <p><strong>Amount:</strong> ${job.amount}</p>
                        <p><strong>Status:</strong> ${job.status}</p>
                          <p><strong>Workers needed:</strong> ${job.worker_id.length}/${job.number_of_workers}</p>
                    </div>
                `;
                container.appendChild(jobElement);
            });
        }

        // Display completed and future jobs in their respective containers
        displayJobs(completedJobs, completedJobsContainer);
        displayJobs(futureJobs, futureJobsContainer);

        // Append the completed and future job containers to the main job container
        jobContainer.appendChild(completedJobsContainer);
        jobContainer.appendChild(futureJobsContainer);
    } catch (error) {
        console.error('Error fetching job data:', error);
    }
}


// Toggle job details visibility
function toggleJobDetails(jobSummaryElement) {
    const jobDetails = jobSummaryElement.nextElementSibling;
    const arrow = jobSummaryElement.querySelector('.arrow');

    if (jobDetails.style.display === 'none') {
        jobDetails.style.display = 'block';
        arrow.textContent = '▲';
    } else {
        jobDetails.style.display = 'none';
        arrow.textContent = '▼';
    }
}

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
