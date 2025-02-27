// Feather icons replacement for any icons you might use
feather.replace();

// Add this at the beginning of your script, right after feather.replace();
let isAuthenticated = false;

// When DOM is loaded, check auth status and fetch profile/job data
document.addEventListener('DOMContentLoaded', async function () {
    await checkAuthStatus();
    await fetchProfileData();
    await fetchJobData();
    // Add network status monitoring
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
});

// Format Date utility
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Fetch and display profile data
async function fetchProfileData() {
    try {
        if (!navigator.onLine) {
            window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/network-error.html';
            return;
        }else {
            checkServerStatus();
        }
        const token = getToken();
        console.log('Token:', token);

        const response = await fetch('https://labourfieldtest.onrender.com/labour/view_profile', {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`, // Add JWT to Authorization header
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('Profile Data:', data);

        const number_of_jobs_posted = data.job_history ? data.job_history.length : 0;

        
        document.getElementById('nameDisplay2').innerText = data.username;
        document.getElementById('genderDisplay').innerText = data.gender;
        document.getElementById('DOBDisplay').innerText = formatDate(data.DOB);
        document.getElementById('phoneDisplay').innerText = data.mobile_number;
        document.getElementById('alt-phoneDisplay').innerText = data.alternate_mobile_number;
        document.getElementById('aadhaarDisplay').innerText = data.aadhaar_ID;
        document.getElementById('emailDisplay').innerText = data.email;
        document.getElementById('addressDisplay').innerText = data.address;
        document.getElementById('stateDisplay').innerText = data.state;
        document.getElementById('cityDisplay').innerText = data.city;
        document.getElementById('talukDisplay').innerText = data.taluk;
    } catch (error) {
        console.error('Error fetching profile data:', error);
        if (!navigator.onLine) {
            window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/network-error.html';
            return;
        }else {
            checkServerStatus();
        }
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
        const response = await fetch('https://labourfieldtest.onrender.com/labour/get_job_history', {
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
        if (!Array.isArray(jobs) || jobs.length === 0) {
            const jobContainer = document.querySelector('.job-created-section');
            jobContainer.innerHTML = '<h2>No jobs available.</h2>'; // Show no jobs message
            return; // Exit the function early
        }

        // Separate jobs into completed and future
        const completedJobs = jobs.filter(job => new Date(job.end_date) < currentDate);
        const futureJobs = jobs.filter(job => new Date(job.start_date) > currentDate);
        console.log('Completed Jobs:', completedJobs);
        console.log('Future Jobs:', futureJobs);

        // Container for displaying jobs
        const jobContainer = document.querySelector('.job-created-section');
        jobContainer.innerHTML = '<h2>Jobs Created</h2>';

        // Create sections for completed and future jobs
        const completedJobsContainer = document.createElement('div');
        const futureJobsContainer = document.createElement('div');

        completedJobsContainer.innerHTML = '<h3>Completed Jobs</h3>';
        futureJobsContainer.innerHTML = '<h3>Future Jobs</h3>';

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
                    <!-- Details Button -->
                    <button class="details-button" onclick="viewJobDetails('${job._id}')">View Details</button>
                </div>
            `;
            container.appendChild(jobElement);
        });
    }

     // Display completed and future jobs
     displayJobs(completedJobs, completedJobsContainer);
     displayJobs(futureJobs, futureJobsContainer);

     // Append completed and future job containers to main job container
     jobContainer.appendChild(completedJobsContainer);
     jobContainer.appendChild(futureJobsContainer);

 } catch (error) {
     console.error('Error fetching job data:', error);
 }
}
// Function to navigate to job details page with job ID
function viewJobDetails(jobId) {
 window.location.href = `https://labourfieldtest.onrender.com/frontend/Labours/job_details/index.html?jobId=${jobId}`;
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
    const overlay = document.getElementById('auth-overlay');
    const popup = document.getElementById('auth-popup');
    
    if (overlay && popup) {
        overlay.style.display = 'block';
        popup.style.display = 'block';
    }

    // Add event listener to close popup when clicking outside
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            removeAuthPopup();
            // Redirect to home page or another appropriate page
            window.location.href = '../../static/home_page/index.html';
        }
    });
}

// Remove the authentication popup and overlay
function removeAuthPopup() {
    const overlay = document.getElementById('auth-overlay');
    const popup = document.getElementById('auth-popup');
    
    if (overlay && popup) {
        overlay.style.display = 'none';
        popup.style.display = 'none';
    }
}

// Logout user
function logoutUser() {
    // Clear the JWT token from localStorage
    localStorage.removeItem('jwt');

    // Remove the popup and overlay (if they exist)
    removeAuthPopup();

    // Redirect to the desired page after logging out
    window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/home_page/index.html'; // Change to your logout redirect page
}

// Check authentication status and show popup or logout button
async function checkAuthStatus() {
    const token = getToken();
    isAuthenticated = !!token; // Convert token to boolean

    if (!isAuthenticated) {
        showAuthPopup();
        // Hide the main content
        document.querySelector('.container').style.display = 'none';
        document.querySelector('.job-created-section').style.display = 'none';
    } else {
        // Show the main content
        document.querySelector('.container').style.display = 'block';
        document.querySelector('.job-created-section').style.display = 'block';
        
        // Add logout button
        const authBtnContainer = document.getElementById('auth-btn-container');
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'logout-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>Logout';
        logoutBtn.onclick = logoutUser;
        authBtnContainer.innerHTML = ''; // Clear existing content
        authBtnContainer.appendChild(logoutBtn);
    }
}

// Get JWT token from localStorage
function getToken() {
    return localStorage.getItem('jwt');  // Retrieve JWT token from localStorage
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
        const response = await fetch('https://labourfieldtest.onrender.com', {
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


// Toggle edit mode
function toggleEdit() {
    const spans = document.querySelectorAll('.form-row span');
    const inputs = document.querySelectorAll('.form-row input');
    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');

    spans.forEach(span => span.style.display = 'none');
    inputs.forEach(input => {
        input.style.display = 'block';
        // Set input value to current display value
        const spanId = input.id.replace('Input', 'Display');
        input.value = document.getElementById(spanId).innerText || '';
    });

    editButton.style.display = 'none';
    saveButton.style.display = 'block';
}

// Save changes to database
async function saveChanges() {
    try {
        const token = getToken();
        const updatedData = {
            username: document.getElementById('nameInput2').value,
            gender: document.getElementById('genderInput').value,
            DOB: document.getElementById('DOBInput').value,
            mobile_number: document.getElementById('phoneInput').value,
            alternate_mobile_number: document.getElementById('alt-phoneInput').value,
            aadhaar_ID: document.getElementById('aadhaarInput').value,
            email: document.getElementById('emailInput').value,
            address: document.getElementById('addressInput').value,
            state: document.getElementById('stateInput').value,
            city: document.getElementById('cityInput').value,
            taluk: document.getElementById('talukInput').value
        };

        const response = await fetch('https://labourfieldtest.onrender.com/labour/update_profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });
       
        // Check if the response is OK
        if (!response.ok) {
            const errorText = await response.text(); // Get the response as text
            console.error('Error response:', errorText); // Log the error response
            throw new Error('Failed to update profile');
        }

        // Attempt to parse the response as JSON
        const responseData = await response.json();
        console.log('Response from server:', responseData);

        // Update display values
        Object.keys(updatedData).forEach(key => {
            const displayId = key === 'username' ? 'nameDisplay2' : `${key}Display`;
            const displayElement = document.getElementById(displayId);
            if (displayElement) {
                displayElement.innerText = updatedData[key];
            }
        });

        // Toggle back to display mode
        const spans = document.querySelectorAll('.form-row span');
        const inputs = document.querySelectorAll('.form-row input');
        const editButton = document.getElementById('editButton');
        const saveButton = document.getElementById('saveButton');

        spans.forEach(span => span.style.display = 'block');
        inputs.forEach(input => input.style.display = 'none');
        editButton.style.display = 'block';
        saveButton.style.display = 'none';

        // Show success message
        alert('Profile updated successfully!');

    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
    }
}

