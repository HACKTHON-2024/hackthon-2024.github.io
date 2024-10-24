document.addEventListener('DOMContentLoaded', async function () {
    const labourList = document.querySelector('.labour-list');
    const backBtn = document.querySelector('.back-btn'); // Select the back button
    const jobListModal = document.getElementById('job-list-modal'); // Select the modal

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
    async function fetchJobs() {
        try {
            const token = getToken(); 
            
            const response = await fetch('http://localhost:3000/landowner/available_jobs', {
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
                labourList.innerHTML = '<p>No jobs available</p>';
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

    // Open modal for phone number input
    function openModal(jobId) {
        const jobListModal = document.getElementById('job-list-modal');
        jobListModal.classList.remove('hidden'); // Show the modal

        // Set job ID as data attribute to the modal
        jobListModal.setAttribute('data-job-id', jobId);
    }

    // Close modal function
    function closeModal() {
        jobListModal.classList.add('hidden'); // Hide the modal
    }

    // Back button event listener to close the modal
    backBtn.addEventListener('click', function () {
        closeModal(); // Close the modal when the back button is clicked
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
    function sendOtp(mobileNumber, jobId) {
        fetch('http://localhost:3000/otp/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mobileNumber }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show OTP section and set jobId and mobileNumber
                const otpSection = document.querySelector('.otp-section');
                otpSection.classList.remove('hidden');
                otpSection.setAttribute('data-job-id', jobId);
                otpSection.setAttribute('data-mobile-number', mobileNumber);

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
    function confirmOtp(otp, jobId, mobileNumber) {
        fetch('http://localhost:3000/otp/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ otp, mobileNumber }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // OTP verified, send job request
                sendJobRequest(jobId, mobileNumber);
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

    // Fetch jobs on page load
    fetchJobs();
});

// Show authentication popup with overlay
function showAuthPopup() {
    // Create the overlay
    const overlay = document.createElement('div');
    overlay.classList.add('auth-overlay'); // Styled in CSS

    // Create the popup
    const popup = document.createElement('div');
    popup.classList.add('auth-popup'); // Styled in CSS

    // Message above buttons
    const authMessage = document.createElement('p');
    authMessage.innerText = 'Need to sign in or sign up?';
    popup.appendChild(authMessage);

    // Create container for the buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container'); // Styled in CSS for flexbox layout

    // Create login button
    const loginBtn = document.createElement('button');
    loginBtn.innerText = 'Login';
    loginBtn.onclick = function () {
        window.location.href = '../signin/index.html'; // Redirect to login page
        removeAuthPopup(); // Remove popup on navigation
    };

    // Create signup button
    const signupBtn = document.createElement('button');
    signupBtn.innerText = 'Sign Up';
    signupBtn.onclick = function () {
        window.location.href = '../SignUp_Page/index.html'; // Redirect to signup page
        removeAuthPopup(); // Remove popup on navigation
    };

    // Append buttons to the container
    buttonContainer.appendChild(loginBtn);
    buttonContainer.appendChild(signupBtn);

    // Add the button container to the popup
    popup.appendChild(buttonContainer);

    // Append the overlay and popup to the body
    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    // Close popup when clicking outside or pressing Escape
    overlay.addEventListener('click', removeAuthPopup);
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            removeAuthPopup();
        }
    });
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
    // Clear the JWT token from localStorage
    localStorage.removeItem('jwt');

    // Remove the popup and overlay (if they exist)
    removeAuthPopup();

    // Redirect to the desired page after logging out
    window.location.href = 'http://localhost:5500/frontend/static/home_page/index.html'; // Change to your logout redirect page
}

// Check authentication status and show popup or logout button
async function checkAuthStatus() {
    const token = getToken();
    const authBtnContainer = document.getElementById('auth-btn-container');

    if (token) {
        // If the user is logged in, show the Logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.innerText = 'Logout';
        logoutBtn.classList.add('logout-btn'); // You can style this in CSS
        logoutBtn.onclick = logoutUser;
        authBtnContainer.appendChild(logoutBtn);
    } else {
        // If the user is not logged in, show the login/signup popup
        showAuthPopup();
    }
}

// Get JWT token from localStorage
function getToken() {
    return localStorage.getItem('jwt');  // Retrieve JWT token from localStorage
}

// Fetch jobs on page load and check authentication
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});
