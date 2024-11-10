document.addEventListener('DOMContentLoaded', function () {
    const loginContainer = document.getElementById('login-container');
    const passwordContainer = document.getElementById('password-container');
    const otpContainer = document.getElementById('otp-container');

    const continueButton = document.getElementById('continue-button');
    const passwordContinueButton = document.getElementById('password-continue');
    const otpButton = document.getElementById('otp-button');
    const otpLoginButton = document.getElementById('otp-login');
    const resendButton = document.getElementById('resend1');
    const goBackLink = document.getElementById('go-back-link');
    const goBackPasswordLink = document.getElementById('go-back-password');

    let isEmail = false; // This will store whether the input is email or mobile number

    // Event listener for Continue button
    continueButton.addEventListener('click', function () {
        const identifier = document.getElementById('email-input').value;

        // Simple validation
        if (!identifier) {
            showMessage('error', 'Input Required', 'Please enter email or mobile number');
            return;
        }

        // Check if input is an email or mobile number
        isEmail = identifier.includes('@');

        // Show password screen
        loginContainer.classList.add('hidden');
        passwordContainer.classList.remove('hidden');
    });

    // Event listener for Password Continue button
    passwordContinueButton.addEventListener('click', async function () {
        const password = document.getElementById('password-input').value;
        const identifier = document.getElementById('email-input').value;

        if (!password) {
            showMessage('error', 'Input Required', 'Please enter your password');
            return;
        }

        // Send login request
        try {
            const response = await fetch('http://localhost:3000/landowner/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });

            const result = await response.json();
            if (response.ok) {
                localStorage.setItem('jwt', result.token);
                showMessage('success', 'Success!', 'Logged in successfully');
                
                // Redirect after message is shown
                setTimeout(() => {
                    window.location.href = "../job_listing/index.html";
                }, 2000);
            } else {
                showMessage('error', 'Login Failed', result.message || "Invalid credentials");
            }
        } catch (error) {
            showMessage('error', 'Error', 'Error logging in. Please try again.');
        }
    });

    // Event listener for OTP button (Get OTP)
    otpButton.addEventListener('click', async function () {
        const identifier = document.getElementById('email-input').value;

        if (!identifier) {
            showMessage('error', 'Input Required', 'Please enter email or mobile number');
            return;
        }

        try {
            const route = isEmail ? 'http://localhost:3000/mail_otp/send-otp' : 'http://localhost:3000/otp/send-otp';
            const response = await fetch(route, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier })
            });

            const result = await response.json();
            if (response.ok) {
                passwordContainer.classList.add('hidden');
                otpContainer.classList.remove('hidden');
                showMessage('success', 'OTP Sent', 'OTP has been sent successfully');
            } else {
                showMessage('error', 'Failed', result.message || "Failed to send OTP");
            }
        } catch (error) {
            showMessage('error', 'Error', 'Error sending OTP. Please try again.');
        }
    });

    // Event listener for OTP Login button (Verify OTP)
    otpLoginButton.addEventListener('click', async function () {
        const otp = document.getElementById('otp-input').value;
        const identifier = document.getElementById('email-input').value;

        if (!otp) {
            showMessage('error', 'Input Required', 'Please enter the OTP');
            return;
        }

        try {
            const route = isEmail ? 'http://localhost:3000/mail_otp/verify-otp' : 'http://localhost:3000/otp/verify-otp';
            const response = await fetch(route, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, otp })
            });

            const result = await response.json();
            if (response.ok) {
                const loginResponse = await fetch('http://localhost:3000/landowner/signin_by_otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier })
                });

                const loginResult = await loginResponse.json();
                if (loginResponse.ok) {
                    localStorage.setItem('jwt', loginResult.token);
                    showMessage('success', 'Success!', 'Logged in successfully');
                    
                    // Redirect after message is shown
                    setTimeout(() => {
                        window.location.href = "../job_listing/index.html";
                    }, 2000);
                } else {
                    showMessage('error', 'Login Failed', loginResult.message || "Login failed");
                }
            } else {
                showMessage('error', 'Verification Failed', result.message || "OTP verification failed");
            }
        } catch (error) {
            showMessage('error', 'Error', 'Error verifying OTP. Please try again.');
        }
    });

    // Event listener for Resend OTP
    resendButton.addEventListener('click', async function () {
        const identifier = document.getElementById('email-input').value;

        try {
            const route = isEmail ? 'http://localhost:3000/mail_otp/send-otp' : 'http://localhost:3000/otp/send-otp';
            const response = await fetch(route, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier })
            });

            if (response.ok) {
                showMessage('success', 'OTP Resent', 'OTP has been resent successfully');
            } else {
                showMessage('error', 'Failed', 'Failed to resend OTP');
            }
        } catch (error) {
            showMessage('error', 'Error', 'Error resending OTP. Please try again.');
        }
    });

    // Go back links
    goBackLink.addEventListener('click', function () {
        passwordContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    goBackPasswordLink.addEventListener('click', function () {
        otpContainer.classList.add('hidden');
        passwordContainer.classList.remove('hidden');
    });
});

function showMessage(type, title, message) {
    const overlay = document.getElementById('messageOverlay');
    const messageBox = overlay.querySelector('.message-box');
    const icon = overlay.querySelector('.message-icon i');
    const titleElement = overlay.querySelector('h3');
    const messageElement = overlay.querySelector('p');

    // Set message type (success or error)
    icon.className = type === 'success' 
        ? 'fas fa-check-circle success-icon'
        : 'fas fa-exclamation-circle error-icon';

    // Set content
    titleElement.textContent = title;
    messageElement.textContent = message;

    // Show overlay
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('show'), 10);

    // Auto hide after 3 seconds
    setTimeout(() => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }, 3000);
}

// Usage examples:
// Success message
// showMessage('success', 'Success!', 'You have successfully logged in.');

// Error message
// showMessage('error', 'Error!', 'Invalid credentials. Please try again.');
