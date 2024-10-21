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
            
            if (!token) {
                showAuthPopup(); // Show login/signup popup if not logged in
                return;
            }
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