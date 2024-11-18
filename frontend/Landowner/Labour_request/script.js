document.addEventListener('DOMContentLoaded', function () {
    // Add network status monitoring
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    updateAuthButton(); // Initialize auth button
    
    const datepicker = document.getElementById('datepicker');

    // Set the default value of the date picker to today's date
    const today = new Date().toISOString().split('T')[0];
    datepicker.value = today; // Set the default date picker value to today

    // Make the date picker read-only to prevent users from changing the date
    datepicker.setAttribute('readonly', true);
 
     fetchLabours(); // Fetch labour data when the page loads
     updateAuthButton(); // Call the function to update the button based on login status
    
     if (!navigator.onLine) {
        window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
        return;
    }

    // Language dropdown functionality
    const languageBtn = document.querySelector('.language-btn');
    const languageDropdown = document.querySelector('.language-dropdown');

    languageBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        languageDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.language-dropdown-container')) {
            languageDropdown.classList.remove('show');
        }
    });

    // Handle language selection
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const selectedLang = this.getAttribute('data-lang');
            const languageText = this.textContent;
            
            // Update button text
            languageBtn.querySelector('span').textContent = languageText;
            
            // Close dropdown
            languageDropdown.classList.remove('show');
            
            // Store selected language
            localStorage.setItem('selectedLanguage', selectedLang);
            
            // You can add translation logic here
            changeLanguage(selectedLang);
        });
    });

    // Add event listener for alert close button
    const alertCloseBtn = document.querySelector('.alert-close');
    if (alertCloseBtn) {
        alertCloseBtn.addEventListener('click', function() {
            document.getElementById('alert-container').classList.add('hidden');
        });
    }
 });
 
 function getToken() {
     return localStorage.getItem('jwt');  // Retrieve JWT token from localStorage
 }
 
 // To store selected labour and job IDs
 let selectedLabourId = null;
 let selectedJobId = null;
 
 // Fetch labour data from API with loading and error handling
 function fetchLabours() {
     const token = getToken();  // Get JWT token
     const labourList = document.getElementById('labour-list');
     
     if (!token) {
         showAuthPopup(); // Show login/signup popup if not logged in
         return;
     }
     
     labourList.innerHTML = '<p>Loading...</p>'; // Show loading indicator
 
     fetch('http://localhost:3000/landowner/available_labours', {
         method: 'GET',
         headers: {
             'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header
             'Content-Type': 'application/json'
         }})
         .then(response => response.json())
         .then(data => {
             if (data.success) {
                 displayLabours(data.data); // Display the labours dynamically
             } else {
                 labourList.innerHTML = `<p>Error: ${data.message}</p>`; // Error handling
             }
         })
         .catch(error => {
             labourList.innerHTML = '<p>Failed to load labour data.</p>'; // Show error message
             console.error('Error during labour fetch:', error);
         });
 }
 
 // Dynamically display labours
 function displayLabours(labours) {
     const labourList = document.getElementById('labour-list');
     labourList.innerHTML = '';

     if (labours.length === 0) {
         labourList.innerHTML = '<p class="no-results">No labourers available</p>';
         return;
     }

     labours.forEach(labour => {
         const labourCard = document.createElement('div');
         labourCard.classList.add('labour-card');

         const skills = labour.job_skills?.trim() || 'No skills listed';

         labourCard.innerHTML = `
             <div class="circle-stars-group">
                 <div class="circle">
                     <i class="fas fa-user-circle"></i>
                 </div>
             </div>
             <div class="labour-info">
                 <div class="info-item">
                     <i class="fas fa-user-tag"></i>
                     <div class="info-content">
                         <strong>Name</strong>
                         <span>${labour.username}</span>
                     </div>
                 </div>
                 <div class="info-item">
                     <i class="fas fa-venus-mars"></i>
                     <div class="info-content">
                         <strong>Gender</strong>
                         <span>${labour.gender}</span>
                     </div>
                 </div>
                 <div class="info-item">
                     <i class="fas fa-tools"></i>
                     <div class="info-content">
                         <strong>Skills</strong>
                         <span>${skills}</span>
                     </div>
                 </div>
             </div>
             <div class="location">
                 <div class="location-box">
                     <div class="location-header">
                         <i class="fas fa-map-marker-alt"></i>
                         <strong>Location</strong>
                     </div>
                     <div class="location-text">
                         ${labour.taluk || 'Location not specified'}
                     </div>
                 </div>
                 <button class="request-btn" onclick="showJobModal('${labour._id}')">
                     <i class="fas fa-handshake"></i>
                     Request Labour
                 </button>
             </div>
         `;

         labourList.appendChild(labourCard);
     });
 }
 
 // Show job list modal and fetch active jobs
function showJobModal(labourId) {
    const jobModal = document.getElementById('job-list-modal');
    jobModal.classList.remove('hidden');
    jobModal.style.opacity = 0;
    setTimeout(() => jobModal.style.opacity = 1, 50);

    fetchActiveAndFutureJobs(labourId);
}
 
 // Same for fetching jobs
 // Fetch both active and future jobs from the backend
function fetchActiveAndFutureJobs(labourId) {
    const token = getToken();  // Get JWT token
    const activeJobsContainer = document.getElementById('active-jobs-container');
    const futureJobsContainer = document.getElementById('future-jobs-container');

    activeJobsContainer.innerHTML = '<p>Loading jobs...</p>';
    futureJobsContainer.innerHTML = '<p>Loading jobs...</p>';

    fetch('http://localhost:3000/landowner/active_jobs_for_request_menu', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const { activeJobs, futureJobs } = data.data;
            displayJobs(activeJobs, activeJobsContainer, labourId, 'No active jobs available.');
            displayJobs(futureJobs, futureJobsContainer, labourId, 'No future jobs available.');
        } else {
            activeJobsContainer.innerHTML = `<p>Error: ${data.message}</p>`;
            futureJobsContainer.innerHTML = `<p>Error: ${data.message}</p>`;
        }
    })
    .catch(error => {
        activeJobsContainer.innerHTML = '<p>Error fetching active jobs.</p>';
        futureJobsContainer.innerHTML = '<p>Error fetching future jobs.</p>';
        console.error('Error fetching jobs:', error);
    });
}
 
 // Display active jobs dynamically
 function displayJobs(jobs, container, labourId, emptyMessage) {
    container.innerHTML = ''; // Clear existing content

    if (jobs.length === 0) {
        container.innerHTML = `<p>${emptyMessage}</p>`;
        return;
    }

    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.classList.add('job-container');

        jobCard.innerHTML = `
            <div class="job-summary" onclick="toggleJobDetails(this)">
                <div class="job-header">
                    <p><strong>Job Title:</strong> ${job.title}</p>
                    <p><strong>Start Date:</strong> ${new Date(job.start_date).toISOString().split('T')[0]}</p>
                    <p><strong>End Date:</strong> ${new Date(job.end_date).toISOString().split('T')[0]}</p>
                    <span class="arrow">▼</span>
                </div>
            </div>
            <div class="job-details" style="display: none;">
                <p><strong>Job Description:</strong></p>
                <div class="editable-box"><span>${job.description}</span></div>
                <p><strong>Job Location:</strong></p>
                <div class="editable-box"><span>${job.location}</span></div>
                <p><strong>Amount:</strong></p>
                <div class="editable-box"><span>${job.amount} rs</span></div>
                <p><strong>Status:</strong></p>
                <div class="editable-box"><span>${job.status}</span></div>
                <p><strong>No. of Workers:</strong></p>
                <div class="editable-box"><span>${job.worker_id.length}/${job.number_of_workers}</span></div>
                <div>
                    <button class="confirm-job-btn" data-job-id="${job._id}">Confirm</button>
                </div>
            </div>
        `;

        container.appendChild(jobCard);
    });

    // Add toggle functionality for job details visibility
    toggleJobDetails();

    // Add event listeners for "Confirm" buttons
    container.querySelectorAll('.confirm-job-btn').forEach(button => {
        button.addEventListener('click', function () {
            selectedJobId = this.getAttribute('data-job-id');
            showConfirmationPopup(labourId, selectedJobId);
        });
    });
}
 
 // Function to toggle job details visibility
 function toggleJobDetails() {
     document.querySelectorAll('.job-summary').forEach(jobSummary => {
         jobSummary.addEventListener('click', function () {
             const jobDetails = this.nextElementSibling;
             const arrow = this.querySelector('.arrow');
 
             if (jobDetails.style.display === 'block') {
                 jobDetails.style.display = 'none';
                 arrow.textContent = '▼'; // Down arrow when hidden
             } else {
                 jobDetails.style.display = 'block';
                 arrow.textContent = '▲'; // Up arrow when shown
             }
         });
     });
 }
 
 // Display no jobs message when no jobs are available
 function displayNoJobsMessage() {
     const jobContainer = document.getElementById('job-container');
     jobContainer.innerHTML = '<p>No active jobs available at the moment.</p>';
 }
 
 // Close button for the job list modal
 const closeJobModalBtn = document.getElementById('close-job-modal');
 closeJobModalBtn.addEventListener('click', function () {
     const jobModal = document.getElementById('job-list-modal');
     jobModal.classList.add('hidden');
 });
 
 // Show confirmation popup
function showConfirmationPopup(labourId, jobId) {
    const confirmationPopup = document.getElementById('confirmation-popup');
    const popupOverlay = document.querySelector('.popup-overlay');

    // Show popup and overlay
    confirmationPopup.style.display = 'block';
    popupOverlay.style.display = 'block';

    // Clear existing event listeners
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    // Remove old event listeners
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    
    // Get new references after cloning
    const newConfirmBtn = document.getElementById('confirm-btn');
    const newCancelBtn = document.getElementById('cancel-btn');

    // Add new event listeners
    newConfirmBtn.addEventListener('click', () => {
        handleConfirm(labourId, jobId);
        confirmationPopup.style.display = 'none';
        popupOverlay.style.display = 'none';
    });

    newCancelBtn.addEventListener('click', () => {
        confirmationPopup.style.display = 'none';
        popupOverlay.style.display = 'none';
    });
}
 
 // Send job confirmation request to the backend
 function handleConfirm(labour_id, job_id) {
     const token = getToken();
     fetch('http://localhost:3000/landowner/request_confirm', {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`,
         },
         body: JSON.stringify({
             job_id: job_id,
             labour_id: labour_id
         })
     })
     .then(response => response.json())
     .then(data => {
         if (data.success || data.message) {
             showAlert('Your job request has been confirmed successfully!', 'success');
             const jobModal = document.getElementById('job-list-modal');
             jobModal.classList.add('hidden');
         } else {
             showAlert((data.error || 'Failed to confirm job request'), 'error');
         }
     })
     .catch(error => {
         console.error('Error during confirmation:', error);
         showAlert('An error occurred while confirming the job request', 'error');
     });
 }
 
 // Function to check the login status and update the button
 function updateAuthButton() {
     const authBtnContainer = document.getElementById('auth-btn-container');
     
     if (!authBtnContainer) {
         console.error('Auth button container not found');
         return;
     }
     
     authBtnContainer.innerHTML = ''; // Clear existing content

     const token = getToken();
     if (token) {
         // Create logout button with consistent styling
         const logoutBtn = document.createElement('button');
         logoutBtn.className = 'logout-btn';
         logoutBtn.innerHTML = `
             <i class="fas fa-sign-out-alt"></i>
             <span>Logout</span>
         `;
         logoutBtn.addEventListener('click', function() {
             localStorage.removeItem('jwt');
             window.location.href = '/frontend/static/home_page/index.html';
         });
         authBtnContainer.appendChild(logoutBtn);
     } else {
         showAuthPopup();
     }
 }
 
 // Function to handle logout
 function handleLogout() {
     localStorage.removeItem('jwt'); // Remove JWT token from localStorage
     showAlert('You have been logged out.', 'success');
     updateAuthButton(); // Update the button to reflect the login state
     window.location.href = 'http://localhost:3000/frontend/static/home_page/index.html'; // Redirect to login page after logout
 }

// Show the authentication popup when logged out
// Show authentication popup with overlay
function showAuthPopup() {
    const overlay = document.getElementById('auth-overlay');
    const popup = document.getElementById('auth-popup');
    
    if (overlay && popup) {
        overlay.classList.add('show');
        popup.classList.add('show');
    }
}

function hideAuthPopup() {
    const overlay = document.getElementById('auth-overlay');
    const popup = document.getElementById('auth-popup');
    
    if (overlay && popup) {
        overlay.classList.remove('show');
        popup.classList.remove('show');
    }
}

// Add click handler to close popup when clicking overlay
document.getElementById('auth-overlay')?.addEventListener('click', hideAuthPopup);

// Update the logout functionality
function logoutUser() {
    try {
        // Clear the JWT token from localStorage
        localStorage.removeItem('jwt');
        
        // Redirect to the home page
        window.location.href = '/frontend/static/home_page/index.html';
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

// Update the checkAuthStatus function
async function checkAuthStatus() {
    const token = getToken();
    const authBtnContainer = document.getElementById('auth-btn-container');
    
    if (!authBtnContainer) {
        console.error('Auth button container not found');
        return;
    }
    
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
        logoutBtn.addEventListener('click', logoutUser); // Add event listener directly
        authBtnContainer.appendChild(logoutBtn);
    } else {
        // If user is not logged in, show the login/signup popup
        showAuthPopup();
    }
}
// Example: Simulate logging in or signing up
// For login button

// Function to handle language change
function changeLanguage(lang) {
    // Add your translation logic here
    console.log(`Language changed to: ${lang}`);
    // Example: Update UI text based on selected language
    const translations = {
        en: {
            title: 'LABOUR REQUEST',
            home: 'Home',
            about: 'About Us',
            services: 'Services',
            support: 'Help & Support'
            // Add more translations as needed
        },
        ta: {
            title: 'தொழிலாளர் கோரிக்கை',
            home: 'முகப்பு',
            about: 'எங்களை பற்றி',
            services: 'சேவைகள்',
            support: 'உதவி & ஆதரவு'
            // Add more translations as needed
        },
        hi: {
            title: 'श्रमि�� अनुरोध',
            home: 'होम',
            about: 'हमारे बारे में',
            services: 'सेवाएं',
            support: 'सहायता और समर्थन'
            // Add more translations as needed
        }
    };

    // Update UI elements with translated text
    if (translations[lang]) {
        document.querySelector('h2').textContent = translations[lang].title;
        // Update other elements as needed
    }
}

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container');
    const alertTitle = alertContainer.querySelector('.alert-title');
    const alertDescription = alertContainer.querySelector('.alert-description');
    const alertIcon = alertContainer.querySelector('.alert-icon');
    
    // Define icons
    const icons = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>`
    };

    // Set title and description based on type
    if (type === 'success') {
        alertTitle.textContent = 'Success!';
        alertDescription.textContent = message;
    } else {
        alertTitle.textContent = 'Error!';
        alertDescription.textContent = message;
    }
    
    // Set icon
    alertIcon.innerHTML = icons[type];
    
    // Set alert type class
    alertContainer.className = 'alert-container';
    alertContainer.classList.add(`alert-${type}`);
    
    // Show alert
    alertContainer.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        alertContainer.classList.add('hidden');
    }, 3000);
}

// Add event listener for close button
document.querySelector('.alert-close').addEventListener('click', () => {
    document.getElementById('alert-container').classList.add('hidden');
});

// Usage example:
// showAlert('Your message here');

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