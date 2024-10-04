// Wait for the DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {

    // Get elements for login and password screens
    const loginContainer = document.getElementById('login-container');
    const passwordContainer = document.getElementById('password-container');
    const continueButton = document.getElementById('continue-button');
    const goBackLink = document.getElementById('go-back-link');

    // Event listener for Continue button on the login screen
    continueButton.addEventListener('click', function() {
        // Hide login container and show password container
        loginContainer.classList.add('hidden');
        passwordContainer.classList.remove('hidden');
    });

    // Event listener for Go Back link on the password screen
    goBackLink.addEventListener('click', function() {
        // Hide password container and show login container
        passwordContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    const otpContainer = document.getElementById('otp-container');

    const passwordContinueButton = document.getElementById('password-continue');
    const otpButton = document.getElementById('otp-button');
    const goBackPasswordLink = document.getElementById('go-back-password');
    const otplogin = document.getElementById('otp-login');
    const resend = document.getElementById('resend1');

    // Event Listeners
    continueButton.addEventListener('click', () => {
        loginContainer.classList.add('hidden');
        passwordContainer.classList.remove('hidden');
    });

    passwordContinueButton.addEventListener('click', () => {
        alert("Logined successfully")
    });

    otplogin.addEventListener('click', () => {
        alert("Logined successfully")
    });

    resend.addEventListener('click', () => {
        alert("OTP Resended")
    });

    otpButton.addEventListener('click', () => {
        passwordContainer.classList.add('hidden');
        otpContainer.classList.remove('hidden');
    });

    goBackLink.addEventListener('click', () => {
        passwordContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    goBackPasswordLink.addEventListener('click', () => {
        otpContainer.classList.add('hidden');
        passwordContainer.classList.remove('hidden');
    });


});
