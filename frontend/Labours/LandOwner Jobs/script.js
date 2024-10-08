// document.addEventListener('DOMContentLoaded', async function () {
//     // Fetch available jobs when the page loads
//     try {
//         const response = await fetch('http://localhost:3000/labour/available_jobs', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${localStorage.getItem('token')}` // Replace with actual token if needed
//             }
//         });

//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }

//         const data = await response.json();

//         if (data.success) {
//             displayJobs(data.data); // Call function to display jobs
//         } else {
//             console.error(data.message);
//         }
//     } catch (error) {
//         console.error('Error fetching jobs:', error);
//     }

//     // Function to dynamically display jobs in the modal
//     function displayJobs(jobs) {
//         const jobListContainer = document.getElementById('job-list-container');
//         jobListContainer.innerHTML = ''; // Clear any existing job cards

//         jobs.forEach(job => {
//             const jobCard = document.createElement('div');
//             jobCard.classList.add('labour-card');
//             jobCard.innerHTML = `
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
//                 <p><strong>Title:</strong> ${job.title}</p>
//                 <p><strong>Description:</strong> ${job.description}</p>
//                 <p><strong>Amount:</strong> ₹${job.amount}</p>
//                 <p><strong>Start Date:</strong> ${new Date(job.start_date).toLocaleDateString()}</p>
//                 <p><strong>End Date:</strong> ${new Date(job.end_date).toLocaleDateString()}</p>
//             </div>
//             <div class="location">
//                 <p><strong>Location:</strong> ${job.taluk}, ${job.city}</p>
//                 <button class="request-btn" data-job-id="${job._id}">REQUEST</button>
//             </div>
//         `;
//             jobListContainer.appendChild(jobCard);
//         });

//         // Add click event listeners to all request buttons after rendering jobs
//         const requestButtons = document.querySelectorAll('.request-btn');
//         requestButtons.forEach(button => {
//             button.addEventListener('click', function () {
//                 const jobId = this.dataset.jobId;
//                 openModal(jobId); // Open modal and pass the jobId
//             });
//         });
//     }

//     let selectedJobId = null; // To store the selected job ID
//     const jobListModal = document.getElementById('job-list-modal');
//     const closeModalButton = document.getElementById('close-job-modal');
//     const selfRegistrationButton = document.getElementById('self-registration-btn');
//     const verifyButton = document.querySelector('.verify-btn');
//     const nextButton = document.querySelector('.next-btn');
//     const backButton = document.querySelector('.back-btn');
//     const otpSection = document.querySelector('.otp-section');
//     const loginInputs = document.querySelector('.login-inputs');
//     const orSeparator = document.getElementById('or-separator');

//     // Function to open the modal
//     function openModal(jobId) {
//         selectedJobId = jobId; // Set the selected job ID
//         jobListModal.classList.remove('hidden'); // Show the modal
//     }

//     // Function to close the modal
//     function closeModal() {
//         jobListModal.classList.add('hidden'); // Hide the modal
//         selectedJobId = null; // Reset the selected job ID
//     }

//     // Add click event listener to close the modal
//     closeModalButton.addEventListener('click', closeModal);

//     // Function to show the OTP section and hide the phone number input
//     function showOtpSection() {
//         loginInputs.classList.add('hidden'); // Hide phone number input
//         otpSection.classList.remove('hidden'); // Show OTP section
//     }

//     // Function to go back to the phone number input section
//     function showPhoneNumberSection() {
//         otpSection.classList.add('hidden'); // Hide OTP section
//         loginInputs.classList.remove('hidden'); // Show phone number input
//     }

//     // Add click event listener to the Next button to show OTP section
//     nextButton.addEventListener('click', function () {
//         showOtpSection();
//         orSeparator.classList.add('hidden'); // Hide the OR separator
//         selfRegistrationButton.classList.add('hidden'); // Hide the Self Registration button
//     });

//     // Add click event listener for the Self Registration button
//     selfRegistrationButton.addEventListener('click', async function () {
//         try {
//             const response = await fetch('http://localhost:3000/labour/endroll', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${localStorage.getItem('token')}` // Replace with actual token if needed
//                 },
//                 body: JSON.stringify({ jobId: selectedJobId })
//             });

//             const data = await response.json();
//             if (data.success) {
//                 alert("Registration successful");
//                 closeModal(); // Close the modal after alert
//             } else {
//                 alert(data.message);
//             }
//         } catch (error) {
//             console.error('Error during self-registration:', error);
//         }
//     });

//     // Add click event listener for the Verify button (OTP Verification)
//     verifyButton.addEventListener('click', async function () {
//         const phoneNumber = document.querySelector('.phone-number-input').value; // Get the phone number
//         const otpInputs = document.querySelectorAll('.otp-input');
//         const otp = Array.from(otpInputs).map(input => input.value).join(''); // Combine OTP inputs

//         try {
//             const response = await fetch('http://localhost:3000/labour/job_endroll_for_others', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${localStorage.getItem('token')}` // Replace with actual token if needed
//                 },
//                 body: JSON.stringify({ phoneNumber, jobId: selectedJobId, otp })
//             });

//             const data = await response.json();
//             if (data.success) {
//                 alert("Registration is successful");
//                 closeModal();
//             } else {
//                 alert(data.message);
//             }
//         } catch (error) {
//             console.error('Error during OTP verification:', error);
//         }
//     });

//     // Add click event listener to the Back button to go back to phone number input
//     backButton.addEventListener('click', function () {
//         showPhoneNumberSection();
//         orSeparator.classList.remove('hidden'); // Show the OR separator
//         selfRegistrationButton.classList.remove('hidden'); // Show the Self Registration button
//     });

//     // Close the modal when clicking outside the modal container
//     window.addEventListener('click', function (event) {
//         if (event.target === jobListModal) {
//             closeModal();
//         }
//     });
// });


document.addEventListener('DOMContentLoaded', async function () {
    // Fetch available jobs when the page loads
    try {
        const response = await fetch('http://localhost:3000/labour/available_jobs', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Replace with actual token if needed
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
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
            const response = await fetch('http://localhost:3000/labour/endroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Replace with actual token if needed
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
                // If OTP is verified, send job and phone number to the job_endroll_for_others route
                const enrollResponse = await fetch('http://localhost:3000/labour/job_endroll_for_others', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Replace with actual token if needed
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
