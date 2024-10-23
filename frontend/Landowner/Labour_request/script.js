document.addEventListener('DOMContentLoaded', function () {
    const datepicker = document.getElementById('datepicker');
     datepicker.addEventListener('focus', function () {
         datepicker.type = 'date';
     });
 
     datepicker.addEventListener('blur', function () {
         if (!datepicker.value) {
             datepicker.type = 'text';
         }
     });
 
     fetchLabours(); // Fetch labour data when the page loads
     updateAuthButton(); // Call the function to update the button based on login status
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
     labourList.innerHTML = ''; // Clear existing labour cards
 
     if (labours.length === 0) {
         labourList.innerHTML = '<p>No labourers available</p>';
         return;
     }
 
     labours.forEach(labour => {
         const labourCard = document.createElement('div');
         labourCard.classList.add('labour-card');
 
         const skills = labour.skills?.trim() || 'No skills listed';
 
         labourCard.innerHTML = `
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
                 <p><strong>NAME:</strong> ${labour.username}</p>
                 <p><strong>GENDER:</strong> ${labour.gender}</p>
                 <p><strong>SKILL:</strong> ${skills}</p>
             </div>
             <div class="location">
                 <p><strong>Location:</strong> ${labour.address} ${labour.city}, ${labour.taluk}</p>
                 <button class="request-btn" data-labour-id="${labour._id}">REQUEST</button>
             </div>
         `;
 
         labourList.appendChild(labourCard);
     });
 
     // Add event listeners for "REQUEST" buttons
     document.querySelectorAll('.request-btn').forEach(button => {
         button.addEventListener('click', function () {
             selectedLabourId = this.getAttribute('data-labour-id');
             showJobModal(selectedLabourId);
         });
     });
 }
 
 // Show job list modal and fetch active jobs
 function showJobModal(labourId) {
     const jobModal = document.getElementById('job-list-modal');
     jobModal.classList.remove('hidden');
     jobModal.style.opacity = 0;
     setTimeout(() => jobModal.style.opacity = 1, 50);
 
     fetchActiveJobs(labourId);
 }
 
 // Same for fetching jobs
 function fetchActiveJobs(labourId) {
     const token = getToken();  // Get JWT token
     const jobContainer = document.getElementById('job-container');
     jobContainer.innerHTML = '<p>Loading jobs...</p>'; // Show loading indicator
 
     fetch('http://localhost:3000/landowner/active_jobs', {
         method: 'GET',
         headers: {
             'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header
             'Content-Type': 'application/json'
         }})
         .then(response => response.json())
         .then(data => {
             if (Array.isArray(data) && data.length > 0) {
                 displayActiveJobs(data, labourId);
             } else {
                 jobContainer.innerHTML = '<p>No active jobs available.</p>'; // Handle no jobs
             }
         })
         .catch(error => {
             jobContainer.innerHTML = '<p>Error fetching jobs.</p>'; // Show error message
             console.error('Error fetching active jobs:', error);
         });
 }
 
 // Display active jobs dynamically
 function displayActiveJobs(jobs, labourId) {
     const jobContainer = document.getElementById('job-container');
     jobContainer.innerHTML = ''; // Clear existing content
 
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
         </div>
 
         <div class="job-details" style="display: none;">
             <p><strong>Job Description:</strong></p>
             <div class="editable-box">
                 <span>${job.description}</span>
             </div>
 
             <p><strong>Job Location:</strong></p>
             <div class="editable-box">
                 <span>${job.location}</span>
             </div>
             <p><strong>Amount:</strong></p>
             <div class="editable-box">
                 <span>${job.amount} rs</span>
             </div>
 
             <p><strong>Status:</strong></p>
             <div class="editable-box">
                 <span>${job.status}</span>
             </div>
 
             <p><strong>No. of Workers:</strong></p>
             <div class="editable-box">
                 <span>${job.number_of_workers}</span>
             </div>
             <div>
                 <button class="confirm-job-btn" data-job-id="${job._id}">Confirm</button>
             </div>
         `;
 
         jobContainer.appendChild(jobCard);
     });
 
     // Add toggle for job details visibility
     toggleJobDetails();
 
     // Add event listeners for "Confirm" buttons
     document.querySelectorAll('.confirm-job-btn').forEach(button => {
         button.addEventListener('click', function () {
             selectedJobId = this.getAttribute('data-job-id');
             // Only show the popup, no API call yet
             showConfirmationPopup(selectedLabourId, selectedJobId);
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
    const popupOverlay = document.querySelector('.popup-overlay'); // Use correct overlay for confirmation

    confirmationPopup.classList.add('show');
    popupOverlay.classList.add('show');

    // Add event listeners for buttons
    document.getElementById('confirm-btn').addEventListener('click', function () {
        handleConfirm(labourId, jobId);
    });
    document.getElementById('cancel-btn').addEventListener('click', function () {
        confirmationPopup.classList.remove('show');
        popupOverlay.classList.remove('show');
    });
}
 
 // Send job confirmation request to the backend
 function handleConfirm(labour_id, job_id) {
     const token = getToken();  // Get JWT token
     fetch('http://localhost:3000/landowner/request_confirm', {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header
 
         },
         body: JSON.stringify({
             job_id: job_id,
             labour_id: labour_id
         })
     })
     .then(response => response.json())
     .then(data => {
         if (data.message) {
             alert('Job request confirmed!');
         } else {
             alert('Error: ' + data.error);
         }
     })
     .catch(error => {
         console.error('Error during confirmation:', error);
     })
     .finally(() => {
         const confirmationPopup = document.getElementById('confirmation-popup');
         const popupOverlay = document.querySelector('.popup-overlay');
         confirmationPopup.classList.remove('show');
         popupOverlay.classList.remove('show');
     });
 }
 
 // Function to check the login status and update the button
 function updateAuthButton() {
     const authBtnContainer = document.getElementById('auth-btn-container');
     authBtnContainer.innerHTML = ''; // Clear any previous button
     const token = getToken(); // Check if token is available (user is logged in)
     if (token) {
         // User is logged in        
         // Create 'Logout' button         
         const logoutButton = document.createElement('button');
         logoutButton.classList.add('logout-btn');
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

// Show the authentication popup when logged out
function showAuthPopup() {
    console.log("login-button")
    document.getElementById("auth-popup").classList.add("show");
    document.querySelector(".auth-popup-overlay").classList.add("show");
    document.getElementById("login-btn").addEventListener("click", function () {
        hideAuthPopup('../signin/index.html'); // Redirect to the login page
    });
    
    // For signup button
    document.getElementById("signup-btn").addEventListener("click", function () {
        hideAuthPopup('../SIgnUp_Page/index.html'); // Redirect to the signup page
    });
}

function hideAuthPopup(targetPage) {
    // Hide the popup
    document.getElementById("auth-popup").classList.remove("show");
    document.querySelector(".auth-popup-overlay").classList.remove("show");
    
    // Delay to ensure the popup hides before redirecting
    window.location.href = targetPage; // Redirect to the target page (login or signup)
}


// Example: Simulate logging out
document.getElementById("logout-btn").addEventListener("click", showAuthPopup);

// Example: Simulate logging in or signing up
// For login button



