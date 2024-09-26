// // Initialize the datepicker
// document.addEventListener('DOMContentLoaded', function () {
//     const datepicker = document.getElementById('datepicker');
//     datepicker.addEventListener('focus', function () {
//         datepicker.type = 'date';
//     });

//     datepicker.addEventListener('blur', function () {
//         if (!datepicker.value) {
//             datepicker.type = 'text';
//         }
//     });

//     // Fetch labor data from the API when the page loads
//     fetchLabours();
// });

// // Function to fetch labour data from the API and display it
// function fetchLabours() {
//     fetch('http://localhost:3000/landowner/available_labours')
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 displayLabours(data.data);
//             } else {
//                 console.error('Error fetching labours:', data.message);
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//         });
// }

// // Function to display the fetched labours dynamically
// function displayLabours(labours) {
//     const labourList = document.getElementById('labour-list');
//     labourList.innerHTML = '';  // Clear any existing labour cards

//     if (labours.length === 0) {
//         labourList.innerHTML = '<p>No labourers available</p>';
//         return;
//     }

//     labours.forEach(labour => {
//         const labourCard = document.createElement('div');
//         labourCard.classList.add('labour-card');

//         // Ensure the skills field is a string; if not, set default text
//         const skills = typeof labour.skills === 'string' && labour.skills.trim() !== '' 
//                        ? labour.skills 
//                        : 'No skills listed';

//         labourCard.innerHTML = `
//             <div class="circle-stars-group">
//                 <div class="circle"></div>
//                 <div class="stars">
//                     <span class="star">&#9733;</span>
//                     <span class="star">&#9733;</span>
//                     <span class="star">&#9733;</span>
//                     <span class="star">&#9733;</span>
//                     <span class="star">&#9733;</span>
//                 </div>
//             </div>
//             <div class="labour-info">
//                 <p><strong>NAME:</strong> ${labour.username}</p>
//                 <p><strong>GENDER:</strong> ${labour.gender}</p>
//                 <p><strong>SKILL:</strong> ${skills}</p>
//             </div>
//             <div class="location">
//                 <p><strong>Location:</strong> ${labour.city}, ${labour.taluk}</p>
//                 <button class="request-btn">REQUEST</button>
//             </div>
//         `;

//         labourList.appendChild(labourCard);
//     });

//     // Add event listeners for the newly created "REQUEST" buttons
//     document.querySelectorAll('.request-btn').forEach(button => {
//         button.addEventListener('click', function () {
//             // Show active jobs modal when the request button is clicked
//             showJobModal();
//         });
//     });
// }

// // Function to show the job list modal
// function showJobModal() {
//     const jobModal = document.getElementById('job-list-modal');
//     jobModal.classList.remove('hidden');
//     jobModal.style.opacity = 0;
//     setTimeout(() => jobModal.style.opacity = 1, 50);   

//     // Fetch and display jobs dynamically inside the modal
//     fetchActiveJobs();
// }

// // Function to fetch active jobs and display them in the modal
// function fetchActiveJobs() {
//     fetch('http://localhost:3000/landowner/active_jobs')
//         .then(response => response.json())
//         .then(data => {
//             if (Array.isArray(data) && data.length > 0) {
//                 console.log(data)
//                 displayActiveJobs(data);
//             } else {
//                 displayNoJobsMessage(); // Handle case where there are no active jobs
//             }
//         })
//         .catch(error => {
//             console.error('Error fetching active jobs:', error);
//         });
// }
// function displayActiveJobs(jobs) {
//     const jobContainer = document.getElementById('job-container');
//     jobContainer.innerHTML = ''; // Clear existing content

//     if (jobs.length === 0) {
//         jobContainer.innerHTML = '<p>No active jobs available</p>';
//         return;
//     }

//     jobs.forEach(job => {
//         const jobCard = document.createElement('div');
//         jobCard.classList.add('job-container');

        // jobCard.innerHTML = `
        //     <div class="job-summary" onclick="toggleJobDetails(this)">
        //         <div class="job-header">
        //             <p><strong>Job Title:</strong> ${job.title}</p>
        //             <p><strong>Start Date:</strong> ${job.startDate}</p>
        //             <p><strong>End Date:</strong> ${job.endDate}</p>
        //             <span class="arrow">▼</span>
        //         </div>
        //     </div>

        //     <div class="job-details" style="display: none;">
        //         <p><strong>Job Description:</strong></p>
        //         <div class="editable-box">
        //             <span>${job.description}</span>
        //         </div>

        //         <p><strong>Job Category:</strong></p>
        //         <div class="editable-box">
        //             <span>${job.category}</span>
        //         </div>

        //         <p><strong>Job Location:</strong></p>
        //         <div class="editable-box">
        //             <span>${job.location}</span>
        //         </div>
        //         <p><strong>Amount:</strong></p>
        //         <div class="editable-box">
        //             <span>${job.amount} rs</span>
        //         </div>

        //         <p><strong>Status:</strong></p>
        //         <div class="editable-box">
        //             <span>${job.status}</span>
        //         </div>

        //         <p><strong>No. of Workers:</strong></p>
        //         <div class="editable-box">
        //             <span>${job.workers}</span>
        //         </div>
        //         <button class="confirm-job-btn"> Confirm </button>
        //     </div>
        // `;

//         jobContainer.appendChild(jobCard);
//     });
//     // Attach event listeners for "Confirm" buttons in the dynamically created job cards
//     document.querySelectorAll('.confirm-job-btn').forEach(button => {
//         button.addEventListener('click', function () {
//             showConfirmationPopup();
//         });
//     });
    
// }

  

// // Display message when no active jobs are found
// function displayNoJobsMessage() {
//     const jobList = document.getElementById('job-list');
//     jobList.innerHTML = '<p>No active jobs available at the moment.</p>';
// }

// // Close button for the modal
// const closeJobModalBtn = document.getElementById('close-job-modal');
// closeJobModalBtn.addEventListener('click', function () {
//     const jobModal = document.getElementById('job-list-modal');
//     jobModal.classList.add('hidden');
// });


// function toggleJobDetails(element) {
//     document.querySelectorAll('.job-summary').forEach(jobSummary => {
//         jobSummary.addEventListener('click', function () {
//             // Toggle job details visibility
//             const jobDetails = this.nextElementSibling;
//             const arrow = this.querySelector('.arrow');

//             if (jobDetails.style.display === 'block') {
//                 jobDetails.style.display = 'none';
//                 arrow.textContent = '▼'; // Down arrow when hidden
//             } else {
//                 jobDetails.style.display = 'block';
//                 arrow.textContent = '▲'; // Up arrow when shown
//             }
//         });
//     });
// }




// Initialize the datepicker
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

    // Fetch labor data from the API when the page loads
    fetchLabours();
});

// Function to fetch labour data from the API and display it
function fetchLabours() {
    fetch('http://localhost:3000/landowner/available_labours')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayLabours(data.data);
            } else {
                console.error('Error fetching labours:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Function to display the fetched labours dynamically
function displayLabours(labours) {
    const labourList = document.getElementById('labour-list');
    labourList.innerHTML = '';  // Clear any existing labour cards

    if (labours.length === 0) {
        labourList.innerHTML = '<p>No labourers available</p>';
        return;
    }

    labours.forEach(labour => {
        const labourCard = document.createElement('div');
        labourCard.classList.add('labour-card');

        // Ensure the skills field is a string; if not, set default text
        const skills = typeof labour.skills === 'string' && labour.skills.trim() !== '' 
                       ? labour.skills 
                       : 'No skills listed';

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
                <p><strong>Location:</strong> ${labour.city}, ${labour.taluk}</p>
                <button class="request-btn">REQUEST</button>
            </div>
        `;

        labourList.appendChild(labourCard);
    });

    // Add event listeners for the newly created "REQUEST" buttons
    document.querySelectorAll('.request-btn').forEach(button => {
        button.addEventListener('click', function () {
            // Show active jobs modal when the request button is clicked
            showJobModal();
        });
    });
}

// Function to show the job list modal
function showJobModal() {
    const jobModal = document.getElementById('job-list-modal');
    jobModal.classList.remove('hidden');
    jobModal.style.opacity = 0;
    setTimeout(() => jobModal.style.opacity = 1, 50);   

    // Fetch and display jobs dynamically inside the modal
    fetchActiveJobs();
}

// Function to fetch active jobs and display them in the modal
function fetchActiveJobs() {
    fetch('http://localhost:3000/landowner/active_jobs')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                displayActiveJobs(data);
            } else {
                displayNoJobsMessage(); // Handle case where there are no active jobs
            }
        })
        .catch(error => {
            console.error('Error fetching active jobs:', error);
        });
}

function displayActiveJobs(jobs) {
    const jobContainer = document.getElementById('job-container');
    jobContainer.innerHTML = ''; // Clear existing content

    if (jobs.length === 0) {
        jobContainer.innerHTML = '<p>No active jobs available</p>';
        return;
    }

    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.classList.add('job-container');

        jobCard.innerHTML = `
        <div class="job-summary" onclick="toggleJobDetails(this)">
            <div class="job-header">
                <p><strong>Job Title:</strong> ${job.title}</p>
                <p><strong>Start Date:</strong> ${job.startDate}</p>
                <p><strong>End Date:</strong> ${job.endDate}</p>
                <span class="arrow">▼</span>
            </div>
        </div>

        <div class="job-details" style="display: none;">
            <p><strong>Job Description:</strong></p>
            <div class="editable-box">
                <span>${job.description}</span>
            </div>

            <p><strong>Job Category:</strong></p>
            <div class="editable-box">
                <span>${job.category}</span>
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
                <span>${job.workers}</span>
            </div>
            <button class="confirm-job-btn"> Confirm </button>
        </div>
    `;

        jobContainer.appendChild(jobCard);
    });

    // Attach event listeners for "Confirm" buttons in the dynamically created job cards
    document.querySelectorAll('.confirm-job-btn').forEach(button => {
        button.addEventListener('click', function () {
            showConfirmationPopup();
        });
    });
}

// Function to display the confirmation popup
function showConfirmationPopup() {
    const confirmationPopup = document.getElementById('confirmation-popup');
    const popupOverlay = document.querySelector('.popup-overlay');

    // Show the popup
    confirmationPopup.classList.add('show');
    popupOverlay.classList.add('show');

    // Remove any previous event listeners to avoid duplication
    const confirmPopupBtn = document.getElementById('confirm-btn');
    const cancelPopupBtn = document.getElementById('cancel-btn');

    // Confirmation handler
    const handleConfirm = function () {
        alert('Job request confirmed!');
        confirmationPopup.classList.remove('show');
        popupOverlay.classList.remove('show');
    };

    // Cancel handler
    const handleCancel = function () {
        confirmationPopup.classList.remove('show');
        popupOverlay.classList.remove('show');
    };

    // Remove previous event listeners
    confirmPopupBtn.removeEventListener('click', handleConfirm);
    cancelPopupBtn.removeEventListener('click', handleCancel);

    // Add event listeners with { once: true } to avoid duplicates
    confirmPopupBtn.addEventListener('click', handleConfirm, { once: true });
    cancelPopupBtn.addEventListener('click', handleCancel, { once: true });
}

// Function to toggle job details visibility
function toggleJobDetails(element) {
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

// Close button for the modal
const closeJobModalBtn = document.getElementById('close-job-modal');
closeJobModalBtn.addEventListener('click', function () {
    const jobModal = document.getElementById('job-list-modal');
    jobModal.classList.add('hidden');
});

// Function to display message when no active jobs are found
function displayNoJobsMessage() {
    const jobList = document.getElementById('job-list');
    jobList.innerHTML = '<p>No active jobs available at the moment.</p>';
}
