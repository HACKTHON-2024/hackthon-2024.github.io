// Feather icons replacement
feather.replace();

// When DOM is loaded, check authentication and fetch job data
document.addEventListener('DOMContentLoaded', async function () {
    await checkAuthStatus();
    
    // Retrieve jobId from URL and fetch job details
    const jobId = getJobIdFromUrl();
    console.log(jobId)
    if (jobId) {
        await fetchJobDetails(jobId);
    } else {
        console.error('No job ID provided in the URL.');
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

// Fetch job details and populate form fields
async function fetchJobDetails(jobId) {
    try {
        const token = getToken();
        const response = await fetch(`http://localhost:3000/labour/job/${jobId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('Job Data:', data);

        if (!data || !data.data) {
            return console.error("Job data could not be fetched.");
        }

        // Access the job and landowner data from the correct path
        const { job, landowner } = data.data;
        populateJobDetails(job);
        displayLandownerDetails(landowner);
    } catch (error) {
        console.error('Error fetching job data:', error);
    }
}

// Populate the job detail form fields
function populateJobDetails(job) {
    if (!job) return;
    
    document.getElementById('jobtitle').value = job.title || '';
    document.getElementById('startdate').value = job.start_date ? formatDate(job.start_date) : '';
    document.getElementById('enddate').value = job.end_date ? formatDate(job.end_date) : '';
    document.getElementById('jobdescription').value = job.description || '';
    document.getElementById('joblocation').value = job.city && job.taluk ? `${job.city}, ${job.taluk}` : '';
    document.getElementById('amount').value = job.amount || '';
    document.getElementById('noofworkers').value = `${job.worker_id?.length || 0}/${job.number_of_workers || 0}`;
}

// Display landowner details in a section below job details
function displayLandownerDetails(landowner) {
    const jobContainer = document.querySelector('.job-created-section');
    
    // Check if landowner exists and has data
    if (!landowner) {
        jobContainer.innerHTML = `
            <h3>Job Owner Details</h3>
            <div class="landowner-container">
                <div class="landowner-details">
                    <p>No landowner details available</p>
                </div>
            </div>
        `;
        return;
    }

    jobContainer.innerHTML = `
        <h3>Job Owner Details</h3>
        <div class="landowner-container">
            <div class="landowner-details">
                <p><strong>Name:</strong> ${landowner.username}</p>
                <p><strong>Phone Number:</strong> ${landowner.mobile_number }</p>
                <p><strong>Address:</strong> ${landowner.address }</p>
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
    window.location.href = 'http://localhost:5500/frontend/static/home_page/index.html';
}

// Check authentication status
async function checkAuthStatus() {
    const token = getToken();
    const authBtnContainer = document.getElementById('auth-btn-container');

    if (token) {
        const logoutBtn = document.createElement('button');
        logoutBtn.innerText = 'Logout';
        logoutBtn.classList.add('logout-btn');
        logoutBtn.onclick = logoutUser;
        authBtnContainer.appendChild(logoutBtn);
    } else {
        showAuthPopup();
    }
}

// Get JWT token from localStorage
function getToken() {
    return localStorage.getItem('jwt');
}
