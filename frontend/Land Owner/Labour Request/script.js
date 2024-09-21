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

//     labours.forEach(labour => {
//         const labourCard = document.createElement('div');
//         labourCard.classList.add('labour-card');

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
//                 <p><strong>NAME:</strong> ${labour.name}</p>
//                 <p><strong>GENDER:</strong> ${labour.gender}</p>
//                 <p><strong>SKILL:</strong> ${labour.skills.join(', ')}</p>
//             </div>
//             <div class="location">
//                 <p><strong>Location:</strong> ${labour.city}, ${labour.taluk}</p>
//                 <button class="request-btn">REQUEST</button>
//             </div>
//         `;

//         labourList.appendChild(labourCard);
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
}

// Handle request button click (opens modal)
document.querySelectorAll('.request-btn').forEach(button => {
    button.addEventListener('click', function () {
        // Show the previous jobs modal with animation
        const jobModal = document.getElementById('job-list-modal');
        jobModal.classList.remove('hidden');
        jobModal.style.opacity = 0;
        setTimeout(() => jobModal.style.opacity = 1, 50);

        // Add click event to job summary (only once)
        document.querySelectorAll('.job-summary').forEach(jobSummary => {
            // Remove existing listeners to avoid double clicks
            const newJobSummary = jobSummary.cloneNode(true);
            jobSummary.parentNode.replaceChild(newJobSummary, jobSummary);

            newJobSummary.addEventListener('click', function () {
                // Toggle job details visibility
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

        // Handle confirm button click inside each job created post
        document.querySelectorAll('.confirm-job-btn').forEach(confirmBtn => {
            // Remove any existing event listeners to avoid duplicates
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

            newConfirmBtn.addEventListener('click', function () {
                // Show the confirmation popup when confirm button is clicked
                const confirmationPopup = document.getElementById('confirmation-popup');
                confirmationPopup.classList.add('show');

                // Optional overlay for background
                const popupOverlay = document.querySelector('.popup-overlay');
                if (popupOverlay) popupOverlay.classList.add('show');

                const handleConfirm = function () {
                    alert('Job request confirmed!');
                    confirmationPopup.classList.remove('show');
                    if (popupOverlay) popupOverlay.classList.remove('show');
                };

                const handleCancel = function () {
                    confirmationPopup.classList.remove('show');
                    if (popupOverlay) popupOverlay.classList.remove('show');
                };

                // Remove previous listeners from confirm and cancel buttons before adding new ones
                const confirmPopupBtn = document.getElementById('confirm-btn');
                const cancelPopupBtn = document.getElementById('cancel-btn');

                // Remove existing listeners
                confirmPopupBtn.removeEventListener('click', handleConfirm);
                cancelPopupBtn.removeEventListener('click', handleCancel);

                // Add event listeners with once:true to avoid duplicates
                confirmPopupBtn.addEventListener('click', handleConfirm, { once: true });
                cancelPopupBtn.addEventListener('click', handleCancel, { once: true });
            });
        });
    });
});

// Close button for the modal
const closeJobModalBtn = document.getElementById('close-job-modal');
closeJobModalBtn.addEventListener('click', function () {
    const jobModal = document.getElementById('job-list-modal');
    jobModal.classList.add('hidden');
});





function toggleJobDetails(element) {
    document.querySelectorAll('.job-summary').forEach(jobSummary => {
        jobSummary.addEventListener('click', function () {
            // Toggle job details visibility
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
