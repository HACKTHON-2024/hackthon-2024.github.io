document.addEventListener('DOMContentLoaded', function () {
    // Get all the request buttons
    const requestButtons = document.querySelectorAll('.request-btn');

    // Get the job list modal and the close button
    const jobListModal = document.getElementById('job-list-modal');
    const closeModalButton = document.getElementById('close-job-modal');

    // Function to open the modal
    function openModal() {
        jobListModal.classList.remove('hidden'); // Remove the 'hidden' class to display the modal
    }

    // Function to close the modal
    function closeModal() {
        jobListModal.classList.add('hidden'); // Add the 'hidden' class to hide the modal
    }

    // Add click event listeners to all request buttons
    requestButtons.forEach(button => {
        button.addEventListener('click', openModal);
    });

    // Add click event listener to the close button to hide the modal
    closeModalButton.addEventListener('click', closeModal);

    // Optional: Close the modal when clicking outside the modal container
    window.addEventListener('click', function (event) {
        if (event.target === jobListModal) {
            closeModal();
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Get the Next and Back buttons and the sections
    const nextButton = document.querySelector('.next-btn');
    const backButton = document.querySelector('.back-btn');
    const otpSection = document.querySelector('.otp-section');
    const loginInputs = document.querySelector('.login-inputs');
    const verifyButton=document.querySelector('.verify-btn')

    // Function to show the OTP section and hide the phone number input
    function showOtpSection() {
        loginInputs.classList.add('hidden'); // Hide the phone number input section
        otpSection.classList.remove('hidden'); // Show the OTP section
    }

    // Function to go back to the phone number input section
    function showPhoneNumberSection() {
        otpSection.classList.add('hidden'); // Hide the OTP section
        loginInputs.classList.remove('hidden'); // Show the phone number input section
    }

    // Add click event listener to the Next button to show OTP section
    nextButton.addEventListener('click', showOtpSection);

    // Add click event listener to display the alert message
    verifyButton.addEventListener('click', function() {
        alert("Registration is successful");
    });

    // Add click event listener to the Back button to go back to phone number input
    backButton.addEventListener('click', showPhoneNumberSection);
});

