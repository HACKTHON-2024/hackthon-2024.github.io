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
// Format date utility function
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Fetch job details and populate form fields and worker details
async function fetchJobDetails(jobId) {
    try {
        const token = getToken();
        const response = await fetch(`http://localhost:3000/landowner/job/${jobId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const jobData = await response.json();
        console.log('Job Data:', jobData);

        if (!jobData || !jobData.job) {
            return console.error("Job data could not be fetched.");
        }

        populateJobDetails(jobData.job);
        displayWorkerDetails(jobData.job.workers);
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
    document.getElementById('noofworkers').value = job.number_of_workers;
}

// Display worker details in a dropdown style under job details
function displayWorkerDetails(workers) {
    const jobContainer = document.querySelector('.job-created-section');
    jobContainer.innerHTML = '<h3>Workers Assigned</h3>';

    if (workers && workers.length > 0) {
        workers.forEach((worker, index) => {
            const workerContainer = document.createElement('div');
            workerContainer.classList.add('worker-container');

            workerContainer.innerHTML = `
                <div class="worker-summary" onclick="toggleWorkerDetails(this)">
                    <p><strong>Worker ${index + 1}:</strong> ${worker.username} <span class="arrow">▼</span></p>
                </div>
                <div class="worker-details" style="display: none;">
                    <p><strong>Gender:</strong> ${worker.gender}</p>
                    <p><strong>Mobile:</strong> ${worker.mobile_number}</p>
                    <p><strong>Skills:</strong> ${worker.job_skills}</p>
                    <p><strong>Location:</strong> ${worker.address}, ${worker.city}, ${worker.state}</p>
                </div>
            `;
            jobContainer.appendChild(workerContainer);
        });
    } else {
        jobContainer.innerHTML += '<p>No workers assigned to this job.</p>';
    }
}

// Toggle worker details visibility
function toggleWorkerDetails(workerSummaryElement) {
    const workerDetails = workerSummaryElement.nextElementSibling;
    const arrow = workerSummaryElement.querySelector('.arrow');

    if (workerDetails.style.display === 'none') {
        workerDetails.style.display = 'block';
        arrow.textContent = '▲';
    } else {
        workerDetails.style.display = 'none';
        arrow.textContent = '▼';
    }
}

// Authentication functions (auth popup, getToken, etc.)
// Show authentication popup with overlay
function showAuthPopup() {
    const overlay = document.createElement('div');
    overlay.classList.add('auth-overlay');

    const popup = document.createElement('div');
    popup.classList.add('auth-popup');

    const authMessage = document.createElement('p');
    authMessage.innerText = 'Need to sign in or sign up?';
    popup.appendChild(authMessage);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const loginBtn = document.createElement('button');
    loginBtn.innerText = 'Login';
    loginBtn.onclick = function () {
        window.location.href = '../signin/index.html';
        removeAuthPopup();
    };

    const signupBtn = document.createElement('button');
    signupBtn.innerText = 'Sign Up';
    signupBtn.onclick = function () {
        window.location.href = '../SignUp_Page/index.html';
        removeAuthPopup();
    };

    buttonContainer.appendChild(loginBtn);
    buttonContainer.appendChild(signupBtn);
    popup.appendChild(buttonContainer);

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    overlay.addEventListener('click', removeAuthPopup);
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            removeAuthPopup();
        }
    });
}

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
