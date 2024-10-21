document.addEventListener('DOMContentLoaded', async function () {
    const labourList = document.querySelector('.labour-list');

    // Fetch active jobs from the server
    async function fetchActiveJobs() {
        try {
            const token = getToken();  // Get JWT token
            
            if (!token) {
                showAuthPopup(); // Show login/signup popup if not logged in
                return;
            }
               
            const response = await fetch('http://localhost:3000/labour/active_jobs', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Check if the error is a 404, and redirect to the 404 page
                if (response.status === 404) {
                    window.location.href = '../404/index.html';  // Adjust path to your 404 page
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const activeJobs = await response.json();
          
            // Check if activeJobs is an array and display them
            if (Array.isArray(activeJobs) && activeJobs.length > 0) {
                activeJobs.forEach(createJobCard);
            } else {
                labourList.innerHTML = '<p>No active jobs available</p>';
            }
        } catch (error) {
            console.error('Error fetching active jobs:', error);
            labourList.innerHTML = `<p>Error fetching active jobs: ${error.message}</p>`;
        }
    }

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
            </div>
        `;

        labourList.appendChild(jobCard);
    }

    // Fetch and display active jobs when the page loads
    fetchActiveJobs();
});


// Function to check the login status and update the button
function updateAuthButton() {
    const authBtnContainer = document.getElementById('auth-btn-container');
    authBtnContainer.innerHTML = ''; // Clear any previous button
    const token = getToken(); // Check if token is available (user is logged in)
    if (token) {
        // User is logged in        
        // Create 'Logout' button
        const logoutButton = document.createElement('button');
        logoutButton.classList.add('auth-btn');
        logoutButton.textContent = 'Logout';
        logoutButton.addEventListener('click', function () {
            handleLogout(); // Handle logout process
        });
        
        // Append both buttons to the container
        authBtnContainer.appendChild(logoutButton);
        
    } 
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('jwt'); // Remove JWT token from localStorage
    alert('You have been logged out.');
    updateAuthButton(); // Update the button to reflect the login state
    window.location.href = 'http://localhost:3000/frontend/static/home_page/index.html'; // Redirect to login page after logout
}
// Function to show login/signup popup
function showAuthPopup() {
    const authPopup = document.getElementById('auth-popup');
    const popupOverlay = document.querySelector('.popup-overlay');

    authPopup.classList.remove('hidden');
    popupOverlay.classList.remove('hidden');

    // Add event listeners for login and signup buttons
    document.getElementById('login-btn').addEventListener('click', function () {
        window.location.href = '../signin/index.html'; // Redirect to login page
    });

    document.getElementById('signup-btn').addEventListener('click', function () {
        window.location.href = '../signup/index.html'; // Redirect to signup page
    });
}

// Close popup function (optional)
function closeAuthPopup() {
    const authPopup = document.getElementById('auth-popup');
    const popupOverlay = document.querySelector('.popup-overlay');

    authPopup.classList.add('hidden');
    popupOverlay.classList.add('hidden');
}
function getToken() {
    return localStorage.getItem('jwt');  // Retrieve JWT token from localStorage
}