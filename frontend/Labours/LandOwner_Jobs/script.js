


document.addEventListener('DOMContentLoaded', async function () {
    // Fetch available jobs when the page loads
    try {
        const token = getToken();  // Get JWT token
            
        if (!token) {
            showAuthPopup(); // Show login/signup popup if not logged in
            return;
        }
                const response = await fetch('http://localhost:3000/labour/available_jobs', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header
            }
        });
        
        if (!response.ok) {
            // Check if the error is a 404, and redirect to the 404 page
            if (response.status === 404) {
                window.location.href = '../404/index.html';  // Adjust path to your 404 page
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            displayJobs(data.data); // Call function to display jobs
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error fetching jobs:', error);
    }

    // Function to dynamically display jobs in the modal
    function displayJobs(jobs) {
        const jobListContainer = document.getElementById('job-list-container');
        jobListContainer.innerHTML = ''; // Clear any existing job cards

        jobs.forEach(job => {
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
            jobListContainer.appendChild(jobCard);
        });

        // Add click event listeners to all request buttons after rendering jobs
        const requestButtons = document.querySelectorAll('.request-btn');
        requestButtons.forEach(button => {
            button.addEventListener('click', function () {
                const jobId = this.dataset.jobId;
                openModal(jobId); // Open modal and pass the jobId
            });
        });
    }

    let selectedJobId = null; // To store the selected job ID
    const jobListModal = document.getElementById('job-list-modal');
    const closeModalButton = document.getElementById('close-job-modal');
    const selfRegistrationButton = document.getElementById('self-registration-btn');
    const verifyButton = document.querySelector('.verify-btn');
    const nextButton = document.querySelector('.next-btn');
    const backButton = document.querySelector('.back-btn');
    const otpSection = document.querySelector('.otp-section');
    const loginInputs = document.querySelector('.login-inputs');
    const orSeparator = document.getElementById('or-separator');

    // Function to open the modal
    function openModal(jobId) {
        selectedJobId = jobId; // Set the selected job ID
        jobListModal.classList.remove('hidden'); // Show the modal
    }

    // Function to close the modal
    function closeModal() {
        jobListModal.classList.add('hidden'); // Hide the modal
        selectedJobId = null; // Reset the selected job ID
    }

    // Add click event listener to close the modal
    closeModalButton.addEventListener('click', closeModal);

    // Function to show the OTP section and hide the phone number input
    function showOtpSection() {
        loginInputs.classList.add('hidden'); // Hide phone number input
        otpSection.classList.remove('hidden'); // Show OTP section
    }

    // Function to go back to the phone number input section
    function showPhoneNumberSection() {
        otpSection.classList.add('hidden'); // Hide OTP section
        loginInputs.classList.remove('hidden'); // Show phone number input
    }

    // Add click event listener to the Next button to show OTP section and send OTP
    nextButton.addEventListener('click', async function () {
        const phoneNumber = document.querySelector('.phone-number-input').value;

        try {
            // Send OTP to the entered phone number
            const response = await fetch('http://localhost:3000/otp/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ identifier: phoneNumber })
            });

            const data = await response.json();
            if (data.success) {
                showOtpSection(); // Show OTP section on successful OTP send
                orSeparator.classList.add('hidden'); // Hide the OR separator
                selfRegistrationButton.classList.add('hidden'); // Hide the Self Registration button
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
        }
    });

    // Add click event listener for the Self Registration button
    selfRegistrationButton.addEventListener('click', async function () {
        try {
            const token = getToken();  // Get JWT token
            const response = await fetch('http://localhost:3000/labour/endroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Add JWT to Authorization header
                },
                body: JSON.stringify({ jobId: selectedJobId })
            });

            const data = await response.json();
            if (data.success) {
                alert("Registration successful");
                closeModal(); // Close the modal after alert
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error during self-registration:', error);
        }
    });

    // Add click event listener for the Verify button (OTP Verification)
    verifyButton.addEventListener('click', async function () {
        const phoneNumber = document.querySelector('.phone-number-input').value; // Get the phone number
        const otpInputs = document.querySelectorAll('.otp-input');
        const otp = Array.from(otpInputs).map(input => input.value).join(''); // Combine OTP inputs
        
        try {
            // Verify the OTP
            const verifyResponse = await fetch('http://localhost:3000/otp/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ identifier: phoneNumber, otp })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
                const token = getToken();  // Get JWT token
                // If OTP is verified, send job and phone number to the job_endroll_for_others route
                const enrollResponse = await fetch('http://localhost:3000/labour/job_endroll_for_others', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ mobile_number: phoneNumber, job_id: selectedJobId })
                });

                const enrollData = await enrollResponse.json();
                if (enrollData.success) {
                    alert("Registration is successful");
                    closeModal();
                } else {
                    alert(enrollData.message);
                }
            } else {
                alert(verifyData.message);
            }
        } catch (error) {
            console.error('Error during OTP verification:', error);
        }
    });

    // Add click event listener to the Back button to go back to phone number input
    backButton.addEventListener('click', function () {
        showPhoneNumberSection();
        orSeparator.classList.remove('hidden'); // Show the OR separator
        selfRegistrationButton.classList.remove('hidden'); // Show the Self Registration button
    });

    // Close the modal when clicking outside the modal container
    window.addEventListener('click', function (event) {
        if (event.target === jobListModal) {
            closeModal();
        }
    });
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
