document.addEventListener('DOMContentLoaded', async function() {
    await checkAuthStatus();
    showWelcomeMessage();
    // ... rest of your DOMContentLoaded code ...

    // Add network status monitoring
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
});

// Move these functions outside of any event listener
function logoutUser() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('hasVisitedJobListing');
    localStorage.removeItem('username');
    removeAuthPopup();
    window.location.href = 'http://localhost:5500/frontend/static/home_page/index.html';
}

function removeAuthPopup() {
    const overlay = document.querySelector('.auth-overlay');
    const popup = document.querySelector('.auth-popup');
    if (overlay) overlay.remove();
    if (popup) popup.remove();
}

async function checkAuthStatus() {
    const token = getToken();
    
    if (!token) {
        sessionStorage.removeItem('currentSessionVisited');
        showAuthPopup();
        return false;
    }
    
    document.querySelector('.container').style.display = 'block';
    const authBtnContainer = document.getElementById('auth-btn-container');
    if (authBtnContainer) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'auth-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Logout</span>';
        logoutBtn.onclick = logoutUser;
        authBtnContainer.innerHTML = '';
        authBtnContainer.appendChild(logoutBtn);
    }

    showWelcomeMessage();
    return true;
}

// Update the showAuthPopup function
function showAuthPopup() {
    const overlay = document.getElementById('auth-overlay');
    const popup = document.getElementById('auth-popup');
    
    if (!overlay || !popup) {
        console.error('Auth overlay or popup elements not found');
        return;
    }

    overlay.style.display = 'block';
    popup.style.display = 'block';

    // Close popup when clicking overlay
    overlay.onclick = function(e) {
        if (e.target === overlay) {
            window.location.href = 'http://localhost:5500/frontend/static/home_page/index.html';
        }
    };
}

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
            if (!navigator.onLine) {
                window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
                return;
            }

            const token = getToken(); // Get JWT token
            console.log(token)
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
                    window.location.href = 'http://localhost:5500/frontend/static/404/index.html'; // Adjust the path to your 404 page
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
            if (!navigator.onLine) {
                window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
            }
        }
    }

    // Function to open the modal
    function openModal(jobId) {
        const jobListModal = document.getElementById('job-list-modal');
        jobListModal.classList.remove('hidden'); // Show the modal by removing the 'hidden' class
        jobListModal.setAttribute('data-job-id', jobId); // Set job ID for further use
    }

    // Function to close the modal
    function closeModal() {
        const jobListModal = document.getElementById('job-list-modal');
        jobListModal.classList.add('hidden'); // Hide the modal by adding the 'hidden' class
    }

    // Event listener for close button
    document.getElementById('close-job-modal').addEventListener('click', closeModal);

    // Close modal if clicking outside of the content
    document.getElementById('job-list-modal').addEventListener('click', function (event) {
        if (event.target.id === 'job-list-modal') {
            closeModal(); // Close the modal
        }
    });

    // Event listener for "Next" button to send OTP
    document.querySelector('.next-btn').addEventListener('click', function () {
        const mobileNumber = document.querySelector('.phone-number-input').value; // Get the phone number input
        const jobId = document.getElementById('job-list-modal').getAttribute('data-job-id'); // Retrieve the job ID from the modal

        if (validateMobileNumber(mobileNumber)) {
            sendOtp(mobileNumber, jobId);
        } else {
            alert('Please enter a valid mobile number');
        }
    });

    // Send OTP using server API
    function sendOtp(identifier, jobId) {
        fetch('http://localhost:3000/otp/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show OTP section and set jobId and mobileNumber
                const otpSection = document.querySelector('.otp-section');
                otpSection.classList.remove('hidden');
                otpSection.setAttribute('data-job-id', jobId);
                otpSection.setAttribute('data-mobile-number', identifier);

                // Enable and focus on the OTP input field
                const otpInput = document.querySelector('.otp-input');
                otpInput.removeAttribute('disabled'); // Enable the OTP input field
                otpInput.focus(); // Focus on the OTP input field
            } else {
                alert('Error sending OTP');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Event listener for Verify button to confirm OTP
    document.querySelector('.verify-btn').addEventListener('click', function () {
        const otp = document.querySelector('.otp-input').value;
        const jobId = document.querySelector('.otp-section').getAttribute('data-job-id'); // Retrieve job ID from OTP section
        const mobileNumber = document.querySelector('.otp-section').getAttribute('data-mobile-number'); // Retrieve mobile number from OTP section

        if (otp.length === 4) {  // Assuming OTP is 4 digits
            confirmOtp(otp, jobId, mobileNumber);
        } else {
            alert('Please enter a valid 4-digit OTP');
        }
    });

    // Verify OTP via server
    function confirmOtp(otp, jobId, identifier) {
        fetch('http://localhost:3000/otp/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ otp, identifier }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // OTP verified, send job request
                sendJobRequest(jobId, identifier);
            } else {
                alert('Invalid OTP, please try again.');
            }
        })
        .catch(error => {
            console.error('Error verifying OTP:', error);
        });
    }

    // Send job request to the server after OTP verification
    async function sendJobRequest(jobId, mobileNumber) {

        try {
            const token = getToken();  // Get JWT token
            const response = await fetch('http://localhost:3000/landowner/request_by_owner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header

                },
                body: JSON.stringify({ jobId, mobileNumber })
            });

            const result = await response.json(); // Assuming response is in JSON format

            if (response.ok && result.success) { // Ensure both HTTP and result success
                alert('Job request sent successfully');
                closeModal(); // Close the modal on success
            } else {
                throw new Error(result.message || 'Failed to send job request');
            }
        } catch (error) {
            console.error('Error sending job request:', error);
            alert('Error sending job request: ' + error.message);
        }
    }

    // Validate mobile number (Indian format)
    function validateMobileNumber(mobileNumber) {
        const mobilePattern = /^[6-9]\d{9}$/; // Indian mobile number pattern
        return mobilePattern.test(mobileNumber);
    }

    // Function to dynamically display jobs in the modal (existing code)
    function displayJobs(jobs) {
        const jobListContainer = document.getElementById('job-list-container');
        jobListContainer.innerHTML = '';

        if (jobs.length === 0) {
            const noJobsMessage = document.createElement('p');
            noJobsMessage.classList.add('no-jobs-message');
            noJobsMessage.innerText = 'No jobs available for the selected date.';
            jobListContainer.appendChild(noJobsMessage);
            return;
        }

        jobs.forEach(job => {
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
                            <button class="request-btn" data-job-id="${job._id}">REQUEST</button>
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
            `;

            jobListContainer.appendChild(jobCard);

            // Add click event for expansion
            const expandBtn = jobCard.querySelector('.expand-btn');
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                jobCard.classList.toggle('expanded');
                const icon = expandBtn.querySelector('i');
                icon.classList.toggle('fa-chevron-up');
                icon.classList.toggle('fa-chevron-down');
            });

            // Add click event for request button
            const requestBtn = jobCard.querySelector('.request-btn');
            requestBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const jobId = e.target.dataset.jobId;
                openModal(jobId);
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
        checkAuthStatus();
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
    // Clear all relevant localStorage items
    localStorage.removeItem('jwt');
    localStorage.removeItem('hasVisitedJobListing'); // Clear the visit flag on logout
    localStorage.removeItem('username');

    // Remove the popup and overlay (if they exist)
    removeAuthPopup();

    // Redirect to the home page
    window.location.href = 'http://localhost:5500/frontend/static/home_page/index.html';
}

// Check authentication status and show popup or logout button
async function checkAuthStatus() {
    const token = getToken();
    const authBtnContainer = document.getElementById('auth-btn-container');
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
        logoutBtn.onclick = logoutUser;
        authBtnContainer.appendChild(logoutBtn);
    } else {
        // If user is not logged in, show the login/signup popup
        showAuthPopup();
    }
}
})
// Get JWT token from localStorage
function getToken() {
    return localStorage.getItem('jwt');  // Retrieve JWT token from localStorage
}

  // Function to open the modal
  function openModal(jobId) {
    selectedJobId = jobId; // Set the selected job ID
    jobListModal.classList.remove('hidden'); // Show the modal
}

// Language dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const languageBtn = document.querySelector('.language-btn');
    const languageDropdown = document.querySelector('.language-dropdown');
    
    languageBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        languageDropdown.style.display = 
            languageDropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        languageDropdown.style.display = 'none';
    });

    // Prevent dropdown from closing when clicking inside
    languageDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Handle language selection
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedLanguage = this.textContent;
            languageBtn.querySelector('span').textContent = selectedLanguage;
            languageDropdown.style.display = 'none';
        });
    });
});

document.querySelectorAll('.labour-card-main').forEach(card => {
    card.addEventListener('click', () => {
        const parentCard = card.closest('.labour-card');
        parentCard.classList.toggle('expanded');
    });
});

// Add this function at the global scope
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return {};
    }
}

// Update showWelcomeMessage to handle errors more gracefully
function showWelcomeMessage() {
    const hasVisited = sessionStorage.getItem('currentSessionVisited');
    const jwt = localStorage.getItem('jwt');
    
    let username = '';
    if (jwt) {
        try {
            const decodedToken = parseJwt(jwt);
            username = decodedToken.username || '';
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }

    if (!hasVisited && jwt) {
        const welcomePopup = document.createElement('div');
        welcomePopup.className = 'welcome-popup';
        welcomePopup.innerHTML = `
            <div class="welcome-content">
                <h2>Welcome${username ? ', ' + username : ''}! 👋</h2>
                <p>Here you can find all available job listings.</p>
                <div class="welcome-features">
                    <div class="feature">
                        <i class="fas fa-search"></i>
                        <span>Browse Jobs</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Find Local Work</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-handshake"></i>
                        <span>Connect with Workers</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(welcomePopup);

        // Set the flag in sessionStorage
        sessionStorage.setItem('currentSessionVisited', 'true');

        // Remove popup after 10 seconds (doubled from 5 seconds)
        setTimeout(() => {
            welcomePopup.style.opacity = '0';
            setTimeout(() => {
                welcomePopup.remove();
            }, 500);
        }, 10000);
    }
}

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