// Feather icons replacement
feather.replace();

// When DOM is loaded, check authentication and fetch job data
document.addEventListener('DOMContentLoaded', async function () {
    // Add network status monitoring
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    await checkAuthStatus();
    
    // Retrieve jobId from URL and fetch job details
    const jobId = getJobIdFromUrl();
    console.log(jobId)
    if (jobId) {
        await fetchJobDetails(jobId);
    } else {
        console.error('No job ID provided in the URL.');
    }
    if (!navigator.onLine) {
        window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/network-error.html';
        return;
    }else {
        checkServerStatus();
    }
});

// Utility function to get jobId from URL query parameters
function getJobIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('jobId'); // Retrieves jobId parameter from the URL
}
// Format date utility function to return 'yyyy-MM-dd' format
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Fetch job details and populate form fields and worker details
async function fetchJobDetails(jobId) {
    try {
        const token = getToken();
        const response = await fetch(`https://labourfieldtest.onrender.com/labour/job/${jobId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const jobData = await response.json();
        console.log('Job Data:', jobData);
       // console.log(jobData.data.job)

        if (!jobData || !jobData.data.job) {
            return console.error("Job data could not be fetched.");
        }

        populateJobDetails(jobData.data.job);
        displayLandownerDetails(jobData.data.landowner);
    } catch (error) {
        console.error('Error fetching job data:', error);
    }
}

// Populate the job detail form fields
function populateJobDetails(job) {
    document.getElementById('jobtitle').value = job.title;
    document.getElementById('startdate').value = formatDate(job.start_date);
    document.getElementById('enddate').value = formatDate(job.end_date);
    document.getElementById('jobdescription').value = job.description;
    document.getElementById('joblocation').value = job.location;
    document.getElementById('amount').value = job.amount;
}

// Enhanced landowner details display
function displayLandownerDetails(landowner) {
    const jobContainer = document.querySelector('.job-created-section');
    jobContainer.innerHTML += `  
        <h3>Landowner Details</h3>
        <div class="landowner-container" data-aos="fade-up">
            <div class="landowner-summary">
                <div class="landowner-avatar">
                    <i class="fas fa-user-circle fa-3x"></i>
                </div>
                <div class="landowner-info">
                    <h4>${landowner.username}</h4>
                    <p>
                        <i class="fas fa-phone"></i>
                        <strong>Mobile:</strong> ${landowner.mobile_number}
                    </p>
                    <p>
                        <i class="fas fa-map-marker-alt"></i>
                        <strong>Address:</strong> ${landowner.address}
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Authentication functions (auth popup, getToken, etc.)
function showAuthPopup() {
    const overlay = document.getElementById('auth-overlay');
    overlay.classList.remove('hidden');
}

// Event listeners for login and signup buttons
document.getElementById('login-btn').addEventListener('click', function() {
    // Redirect to login page
    window.location.href = '../signin/index.html'; // Replace with your login page URL
});

document.getElementById('signup-btn').addEventListener('click', function() {
    // Redirect to signup page
    window.location.href = '../SignUp_Page/index.html'; // Replace with your signup page URL
});

// Remove authentication popup and overlay
function removeAuthPopup() {
    const overlay = document.querySelector('.auth-overlay');
    const popup = document.querySelector('.auth-popup');
    if (overlay) overlay.remove();
    if (popup) popup.remove();
}

// Logout user
function logoutUser() {
    localStorage.removeItem('jwt');
    removeAuthPopup();
    window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/home_page/index.html';
}

// Check authentication status
async function checkAuthStatus() {
    try {
        const token = getToken();
        const authBtnContainer = document.getElementById('auth-btn-container');

        if (!authBtnContainer) {
            console.error('Auth button container not found');
            return;
        }

        // Clear any existing content
        authBtnContainer.innerHTML = '';

        if (token) {
            const logoutBtn = document.createElement('button');
            logoutBtn.innerText = 'Logout';
            logoutBtn.classList.add('logout-btn');
            logoutBtn.onclick = logoutUser;
            authBtnContainer.appendChild(logoutBtn);
        } else {
            showAuthPopup();
        }
    } catch (error) {
        console.error('Error in checkAuthStatus:', error);
    }
}

// Get JWT token from localStorage
function getToken() {
    return localStorage.getItem('jwt');
}

// Add this new function to handle network changes
function handleNetworkChange(event) {
    if (!navigator.onLine) {
        // Redirect to network error page when offline
        window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/network-error.html';
    } else {
        // Optional: Reload the current page when coming back online
        // Only reload if we were previously on the job listing page
        const currentPath = window.location.pathname;
        if (currentPath.includes('network_error')) {
            window.location.href = '../job_listing/index.html';
        }
    }
}

// Add this at the beginning of your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    const infoButton = document.querySelector('.floating-info');
    const infoModal = document.querySelector('.info-modal');
    const overlay = document.querySelector('.info-overlay');
    const closeButton = document.querySelector('.close-modal');

    function showModal() {
        infoModal.classList.add('active');
        overlay.classList.add('active');
    }

    function hideModal() {
        infoModal.classList.remove('active');
        overlay.classList.remove('active');
    }

    infoButton.addEventListener('click', showModal);
    closeButton.addEventListener('click', hideModal);
    overlay.addEventListener('click', hideModal);
});

// Function to handle network changes
function handleNetworkChange(event) {
    if (!navigator.onLine) {
        // Redirect to network error page when offline
        window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/network-error.html';
    } else {
        const currentPath = window.location.pathname;
        if (currentPath.includes('network-error') || currentPath.includes('server-error')) {
            checkServerStatus().then(isServerRunning => {
                if (isServerRunning) {
                    window.history.back();
                }
            });
        }
    }
}

// Function to check if server is running
async function checkServerStatus() {
    try {
        const response = await fetch('https://labourfieldtest.onrender.com/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(5000)
        });
        return true;
    } catch (error) {
        if (!window.location.pathname.includes('server-error.html')) {
            window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/server-error.html';
        }
        return false;
    }
}
