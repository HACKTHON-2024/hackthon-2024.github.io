document.addEventListener('DOMContentLoaded', function () {
    feather.replace();

    // Add network status monitoring
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    // Handle the form submission
    const createJobButton = document.querySelector('.create-job-btn');
    createJobButton.addEventListener('click', async function (e) {
        e.preventDefault();

        // Collect form data
        const jobTitle = document.getElementById('job-title').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const handsNeed = document.getElementById('hands-need').value;
        const jobDescription = document.getElementById('job-description').value;
        const jobLocation = document.getElementById('job-location').value;
        const payment = document.getElementById('payment').value;

        const payload = {
            title: jobTitle,
            start_date: startDate,
            end_date: endDate,
            number_of_workers: handsNeed,
            description: jobDescription,
            location: jobLocation,
            amount: payment
        };

        try {
            if (!navigator.onLine) {
                window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
                return;
            }else {
                checkServerStatus();
            }
            const token = getToken();  // Get JWT token
            
            if (!token) {
                showAuthPopup(); // Show login/signup popup if not logged in
                return;
            }
            // Send data to the server
            const response = await fetch('http://localhost:3000/landowner/createjob', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header

                },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();

            if (response.ok) {
                alert('Job created successfully');
                console.log('Job:', result.job);
            } else {
                alert('Error creating job: ' + result.message);
                console.error('Validation Errors:', result.errors);
            }
        } catch (error) {
            alert('An error occurred while creating the job');
            console.error('Error:', error);
            if (!navigator.onLine) {
                window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
                return;
            }else {
                checkServerStatus();
            }
        }
    });

    // Move the job type event listener here
    document.getElementById('job-type').addEventListener('change', function () {
        const jobType = this.value;

        // Fixed standard amounts for each job type
        const standardAmounts = {
            harvesting: 2000,
            ploughing: 1500,
            seeding: 1000,
            irrigation: 1200,
            weeding: 800,
            "pesticide-spraying": 1800,
            "fertilizer-application": 1600,
            "crop-monitoring": 1400,
            "soil-testing": 2200,
            packaging: 1300,
        };

        // Update the standard amount field
        const standardAmountField = document.getElementById('standard-amount');
        if (standardAmounts[jobType]) {
            standardAmountField.value = `₹${standardAmounts[jobType]}`;
        } else {
            standardAmountField.value = '';
        }
    });
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

    // Function to handle network changes
function handleNetworkChange(event) {
    if (!navigator.onLine) {
        // Redirect to network error page when offline
        window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
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
        const response = await fetch('http://localhost:3000/api/users/check-auth', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(5000)
        });
        return true;
    } catch (error) {
        if (!window.location.pathname.includes('server-error.html')) {
            window.location.href = 'http://localhost:5500/frontend/static/server-error.html';
        }
        return false;
    }
}
