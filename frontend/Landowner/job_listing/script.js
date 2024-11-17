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
            const token = getToken(); // Get JWT token
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