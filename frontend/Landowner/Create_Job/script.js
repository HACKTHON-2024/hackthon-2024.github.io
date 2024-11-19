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
            }
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

    document.addEventListener('DOMContentLoaded', function() {
        // Create and append the tour button
        const tourButton = document.createElement('button');
        tourButton.id = 'startTour';
        tourButton.className = 'tour-button';
        tourButton.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>Take a Tour</span>
        `;
        document.body.appendChild(tourButton);

        // Initialize Shepherd Tour
        const tour = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
                classes: 'shadow-md bg-purple-dark',
                scrollTo: true,
                cancelIcon: {
                    enabled: true
                }
            }
        });

        // Add tour steps
        tour.addStep({
            id: 'welcome',
            text: 'Welcome! Let us show you how to use this page.',
            attachTo: {
                element: '.page-controls',
                on: 'bottom'
            },
            buttons: [{
                text: 'Next',
                action: tour.next
            }]
        });

        tour.addStep({
            id: 'job-cards',
            text: 'Here you can see all your active jobs.',
            attachTo: {
                element: '.labour-card',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Back',
                    action: tour.back
                },
                {
                    text: 'Next',
                    action: tour.next
                }
            ]
        });

        tour.addStep({
            id: 'navigation',
            text: 'Use this navigation bar to move between different sections.',
            attachTo: {
                element: '.navbar',
                on: 'right'
            },
            buttons: [
                {
                    text: 'Back',
                    action: tour.back
                },
                {
                    text: 'Finish',
                    action: tour.complete
                }
            ]
        });

        // Add click event to start tour
        tourButton.addEventListener('click', () => {
            tour.start();
        });
    });