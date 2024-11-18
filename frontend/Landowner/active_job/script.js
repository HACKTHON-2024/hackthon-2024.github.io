document.addEventListener('DOMContentLoaded', async function () {

    const datepicker = document.getElementById('datepicker');

    // Set the default value of the date picker to today's date
    const today = new Date().toISOString().split('T')[0];
    datepicker.value = today; // Set the default date picker value to today

    // Make the date picker read-only to prevent users from changing the date
    datepicker.setAttribute('readonly', true);

    const labourList = document.querySelector('.labour-list');

    // Add network status monitoring
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    // Function to fetch active jobs from the server
    async function fetchActiveJobs() {
        try {
            if (!navigator.onLine) {
                window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
                return;
            }
            const token = getToken();  // Get JWT token

            const response = await fetch('http://localhost:3000/landowner/active_jobs', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
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
            if (!navigator.onLine) {
                window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
            }
        }
    }

    // Function to create and display job cards dynamically
    function createJobCard(job) {
        const jobCard = document.createElement('div');
        jobCard.classList.add('labour-card');
        
        jobCard.innerHTML = `
            <div class="labour-card-main">
                <div class="card-header">
                    <div class="title-section">
                        <div class="profile-circle"></div>
                        <h3 class="job-title">${job.title}</h3>
                    </div>
                    <div class="location-badge">
                        <i class="fas fa-map-marker-alt"></i>
                        ${job.taluk}, ${job.city}
                    </div>
                </div>

                <div class="card-content">
                    <div class="date-info">
                        <div class="date-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span><strong>Start:</strong> ${new Date(job.start_date).toLocaleDateString()}</span>
                        </div>
                        <div class="date-item">
                            <i class="fas fa-calendar-check"></i>
                            <span><strong>End:</strong> ${new Date(job.end_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="expand-btn">
                            Details <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="labour-card-details">
                <div class="details-grid">
                    <div class="detail-item">
                        <i class="fas fa-align-left"></i>
                        <span><strong>Description:</strong> ${job.description}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-money-bill"></i>
                        <span><strong>Amount:</strong> ₹${job.amount}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-users"></i>
                        <span><strong>Workers:</strong> ${job.worker_id.length}/${job.number_of_workers}</span>
                    </div>
                </div>
            </div>
            <div class="job-actions">
                <button onclick="window.location.href='/frontend/Landowner/Labour_Assigned/index.html?jobId=${job._id}'" class="view-laborers-btn">
                    <i class="fas fa-users"></i>
                    Registered Laborers
                </button>
            </div>
        `;

        // Add click event for expansion
        const expandBtn = jobCard.querySelector('.expand-btn');
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            jobCard.classList.toggle('expanded');
            const icon = expandBtn.querySelector('i');
            icon.classList.toggle('fa-chevron-up');
            icon.classList.toggle('fa-chevron-down');
        });

        document.getElementById('job-list-container').appendChild(jobCard);
    }

    // Fetch and display active jobs when the page loads
    fetchActiveJobs();
});


// Show authentication popup with overlay
function showAuthPopup() {
    const overlay = document.getElementById('auth-overlay');
    const popup = document.getElementById('auth-popup');
    
    if (overlay && popup) {
        overlay.classList.add('show');
        popup.classList.add('show');
    }
}

function hideAuthPopup() {
    const overlay = document.getElementById('auth-overlay');
    const popup = document.getElementById('auth-popup');
    
    if (overlay && popup) {
        overlay.classList.remove('show');
        popup.classList.remove('show');
    }
}

// Add click handler to close popup when clicking overlay
document.getElementById('auth-overlay')?.addEventListener('click', hideAuthPopup);

// Update the logout functionality
function logoutUser() {
    try {
        // Clear the JWT token from localStorage
        localStorage.removeItem('jwt');
        
        // Redirect to the home page
        window.location.href = '/frontend/static/home_page/index.html';
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

// Update the checkAuthStatus function
async function checkAuthStatus() {
    const token = getToken();
    const authBtnContainer = document.getElementById('auth-btn-container');
    
    if (!authBtnContainer) {
        console.error('Auth button container not found');
        return;
    }
    
    authBtnContainer.innerHTML = ''; // Clear existing content

    if (token) {
        // If user is logged in, show the styled Logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.className = 'auth-btn';
        logoutBtn.innerHTML = `
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
        `;
        logoutBtn.addEventListener('click', logoutUser); // Add event listener directly
        authBtnContainer.appendChild(logoutBtn);
    } else {
        // If user is not logged in, show the login/signup popup
        showAuthPopup();
    }
}

// Get JWT token from localStorage
function getToken() {
    return localStorage.getItem('jwt');
}

// Make sure to call checkAuthStatus when the page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

// Add this new function to handle network changes
function handleNetworkChange(event) {
    if (!navigator.onLine) {
        // Redirect to network error page when offline
        window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
    } else {
        // Optional: Reload the current page when coming back online
        // Only reload if we were previously on the job listing page
        const currentPath = window.location.pathname;
        if (currentPath.includes('network_error')) {
            window.location.href = '../job_listing/index.html';
        }
    }
}