document.addEventListener('DOMContentLoaded', function () {
    feather.replace();

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