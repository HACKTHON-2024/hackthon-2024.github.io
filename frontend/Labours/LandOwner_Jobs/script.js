document.addEventListener('DOMContentLoaded', async function() {
    await checkAuthStatus();
    
    const datepicker = document.getElementById('datepicker');
    const today = new Date().toISOString().split('T')[0];
    datepicker.value = today;
    datepicker.setAttribute('min', today);
    
    await fetchJobs(today);
    
    datepicker.addEventListener('change', function() {
        fetchJobs(this.value);
    });

    // Modal elements
    const jobListModal = document.getElementById('job-list-modal');
    const closeModalButton = document.getElementById('close-job-modal');
    const selfRegistrationButton = document.getElementById('self-registration-btn');
    const verifyButton = document.querySelector('.verify-btn');
    const nextButton = document.querySelector('.next-btn');
    const backButton = document.querySelector('.back-btn');
    const otpSection = document.querySelector('.otp-section');
    const loginInputs = document.querySelector('.login-inputs');
    const orSeparator = document.getElementById('or-separator');
    let selectedJobId = null;

    // Setup OTP input handling
    setupOtpInputs();

    // Modal event listeners
    closeModalButton.addEventListener('click', closeModal);
    nextButton.addEventListener('click', handleNextButton);
    verifyButton.addEventListener('click', handleVerifyButton);
    backButton.addEventListener('click', handleBackButton);
    selfRegistrationButton.addEventListener('click', handleSelfRegistration);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === jobListModal) closeModal();
    });
});

// Setup OTP input functionality
function setupOtpInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            if (e.target.value.length === 1) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });
}

// Modal visibility functions
function showOtpSection() {
    document.querySelector('.login-inputs').classList.add('hidden');
    document.querySelector('.otp-section').classList.remove('hidden');
    document.querySelector('.personally-enroll-container').classList.add('hidden');
}

function showPhoneNumberSection() {
    document.querySelector('.otp-section').classList.add('hidden');
    document.querySelector('.login-inputs').classList.remove('hidden');
    document.querySelector('.personally-enroll-container').classList.remove('hidden');
}

function handleBackButton() {
    showPhoneNumberSection();
}

// Job fetching and display functions
async function fetchJobs(selectedDate) {
    try {
        const token = getToken();
        if (!token) {
            showAuthPopup();
            return;
        }

        const url = `http://localhost:3000/labour/available_jobs${selectedDate ? `?selectedDate=${selectedDate}` : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                window.location.href = '../404/index.html';
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            displayJobs(data.data);
        }
    } catch (error) {
        console.error('Error fetching jobs:', error);
    }
}

function displayJobs(jobs) {
    const jobListContainer = document.getElementById('job-list-container');
    jobListContainer.innerHTML = '';

    if (jobs.length === 0) {
        jobListContainer.innerHTML = '<p class="no-jobs-message">No jobs available for the selected date.</p>';
        return;
    }

    jobs.forEach(job => {
        const jobCard = createJobCard(job);
        jobListContainer.appendChild(jobCard);
    });
}

// Modal handling functions
function openModal(jobId) {
    selectedJobId = jobId;
    const modal = document.getElementById('job-list-modal');
    modal.classList.remove('hidden');
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');
    document.body.appendChild(overlay);
    
    // Reset form state
    showPhoneNumberSection();
    document.querySelector('.phone-number-input').value = '';
    document.querySelectorAll('.otp-input').forEach(input => input.value = '');

    // Close modal when clicking overlay
    overlay.addEventListener('click', () => {
        closeModal();
        overlay.remove();
    });
}

function closeModal() {
    document.getElementById('job-list-modal').classList.add('hidden');
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.remove();
    selectedJobId = null;
}

async function handleNextButton() {
    const phoneNumber = document.querySelector('.phone-number-input').value;
    
    // Validate phone number
    if (!phoneNumber.match(/^[6-9]\d{9}$/)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/otp/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: phoneNumber })
        });

        const data = await response.json();
        if (data.success) {
            showOtpSection();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        alert('Failed to send OTP. Please try again.');
    }
}

async function handleVerifyButton() {
    const phoneNumber = document.querySelector('.phone-number-input').value;
    const otpInputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');
    
    if (otp.length !== 4) {
        alert('Please enter a valid 4-digit OTP');
        return;
    }

    try {
        const verifyResponse = await fetch('http://localhost:3000/otp/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: phoneNumber, otp })
        });

        const verifyData = await verifyResponse.json();
        if (verifyData.success) {
            const token = getToken();
            const enrollResponse = await fetch('http://localhost:3000/labour/job_endroll_for_others', {
                method: 'POST', // Changed from GET to POST
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    mobile_number: phoneNumber, 
                    job_id: selectedJobId 
                })
            });

            const enrollData = await enrollResponse.json();
            if (enrollData.success) {
                alert("Registration successful");
                closeModal();
            } else {
                alert(enrollData.message);
            }
        } else {
            alert('Invalid OTP. Please try again.');
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        alert('Failed to verify OTP. Please try again.');
    }
}

async function handleSelfRegistration() {
    try {
        const token = getToken();
        const response = await fetch('http://localhost:3000/labour/endroll', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ jobId: selectedJobId })
        });

        const data = await response.json();
        if (data.success) {
            alert("Registration successful");
            closeModal();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error during self-registration:', error);
    }
}

// Helper functions
function createJobCard(job) {
    const jobCard = document.createElement('div');
    jobCard.classList.add('labour-card');
    
    const defaultProfileImage = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    
    jobCard.innerHTML = `
        <div class="card-header">
            <div class="profile-section">
                <div class="profile-header">
                    <div class="profile-image">
                        <img src="${defaultProfileImage}" alt="Profile" onerror="this.src='${defaultProfileImage}'">
                    </div>
                    <div class="user-name">${job.title}</div>
                </div>
                <div class="dates-section">
                    <div class="date-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Start: ${new Date(job.start_date).toLocaleDateString()}</span>
                    </div>
                    <div class="date-item">
                        <i class="fas fa-calendar-check"></i>
                        <span>End: ${new Date(job.end_date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            
            <div class="location-section">
                <div class="location-badge">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${job.taluk}, ${job.city}</span>
                </div>
            </div>
        </div>
        
        <div class="card-details">
            <div class="details-grid">
                <div class="detail-item">
                    <i class="fas fa-tasks"></i>
                    <span><strong>Description:</strong> ${job.description}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-rupee-sign"></i>
                    <span><strong>Amount:</strong> ₹${job.amount}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-users"></i>
                    <span><strong>Workers:</strong> ${job.worker_id.length}/${job.number_of_workers}</span>
                </div>
            </div>
        </div>

        <div class="card-actions">
            <button class="details-btn">
                <i class="fas fa-chevron-down"></i>
                <span>Details</span>
            </button>
            <button class="request-btn" data-job-id="${job._id}">Request</button>
        </div>
    `;

    // Add click handler for details button
    const detailsBtn = jobCard.querySelector('.details-btn');
    const cardDetails = jobCard.querySelector('.card-details');
    const chevronIcon = detailsBtn.querySelector('i');
    
    detailsBtn.addEventListener('click', () => {
        cardDetails.classList.toggle('expanded');
        chevronIcon.style.transform = cardDetails.classList.contains('expanded') 
            ? 'rotate(180deg)' 
            : 'rotate(0)';
    });

    // Add click handler for request button
    jobCard.querySelector('.request-btn').addEventListener('click', () => openModal(job._id));

    return jobCard;
}

// ... rest of your existing authentication and utility functions ...

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
    
    if (!token) {
        showAuthPopup();
        return false;
    }
    
    // Get the container and clear any existing content
    const authBtnContainer = document.getElementById('auth-btn-container');
    if (authBtnContainer) {
        authBtnContainer.innerHTML = ''; // Clear existing content
        
        // Create the logout button with icon and text
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'auth-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Logout</span>';
        logoutBtn.onclick = logoutUser;
        
        authBtnContainer.appendChild(logoutBtn);
    }

    return true;
}

// Get JWT token from localStorage
function getToken() {
    return localStorage.getItem('jwt');  // Retrieve JWT token from localStorage
}

// Fetch jobs on page load and check authentication
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});