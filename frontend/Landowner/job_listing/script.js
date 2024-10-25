document.addEventListener('DOMContentLoaded', async function () {
    const datepicker = document.getElementById('datepicker');

    // Set the default value of the date picker to the current date
    const today = new Date().toISOString().split('T')[0];
    datepicker.value = today; // Set default to current date
    datepicker.setAttribute('min', today);  // Prevent past dates

    // Fetch jobs for the current date when the page loads
    fetchJobs(today);

    // Ensure date picker allows selecting another date
    datepicker.addEventListener('change', function () {
        const selectedDate = datepicker.value;
        fetchJobs(selectedDate); // Fetch jobs for the selected date
    });

    const labourList = document.querySelector('.labour-list');

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
                <button class="request-btn" data-job-id="${job._id}">REQUEST</button>
            </div>
        `;

        labourList.appendChild(jobCard);
    }

    // Fetch jobs from the server
    async function fetchJobs(selectedDate) {
        try {
            const token = getToken(); 
            if (!token) {
                showAuthPopup(); // Show login/signup popup if not logged in
                return;
            }

            let url = 'http://localhost:3000/landowner/available_jobs';
            if (selectedDate) {
                url += `?selectedDate=${selectedDate}`; // Append the selected date to the URL as a query parameter
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header
                    'Content-Type': 'application/json'
                }});
            
            const result = await response.json();
            labourList.innerHTML = ''; // Clear previous jobs

            if (result.success && result.data.length > 0) {
                result.data.forEach(job => {
                    createJobCard(job);
                });
                addRequestButtonEventListeners();
            } else {
                labourList.innerHTML = '<p>No jobs available for the selected date</p>';
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            labourList.innerHTML = '<p>Error fetching jobs</p>';
        }
    }

    // Add event listeners to request buttons
    function addRequestButtonEventListeners() {
        const requestButtons = document.querySelectorAll('.request-btn');
        requestButtons.forEach(button => {
            button.addEventListener('click', function () {
                const jobId = button.getAttribute('data-job-id');
                openModal(jobId);
            });
        });
    }



    // Additional functions for authentication and job request handling (same as before)
    // ...


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

// Additional functions for logout, authentication popup, etc.


    // Function to handle logout
    function handleLogout() {
        localStorage.removeItem('jwt');
        alert('You have been logged out.');
        updateAuthButton();
        window.location.href = 'http://localhost:3000/frontend/static/home_page/index.html';
    }

    // Function to show login/signup popup
    function showAuthPopup() {
        const authPopup = document.getElementById('auth-popup');
        const popupOverlay = document.querySelector('.popup-overlay');

        authPopup.classList.remove('hidden');
        popupOverlay.classList.remove('hidden');

        document.getElementById('login-btn').addEventListener('click', function () {
            window.location.href = '../signin/index.html';
        });

        document.getElementById('signup-btn').addEventListener('click', function () {
            window.location.href = '../signup/index.html';
        });
    }

    // Close popup function
    function closeAuthPopup() {
        const authPopup = document.getElementById('auth-popup');
        const popupOverlay = document.querySelector('.popup-overlay');

        authPopup.classList.add('hidden');
        popupOverlay.classList.add('hidden');
    }

    function getToken() {
        return localStorage.getItem('jwt');
    }
});
