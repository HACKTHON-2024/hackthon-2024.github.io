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
            alert("Please enter email or mobile number");
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
            alert("Please enter your password");
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
            console.log(result)
            if (response.ok) {
                // Store JWT in local storage
                localStorage.setItem('jwt', result.token);
                alert("Logged in successfully");
            } else {
                alert(result.message || "Login failed");
            }
        } catch (error) {
            alert("Error logging in");
        }
    });

    // Event listener for OTP button (Get OTP)
    otpButton.addEventListener('click', async function () {
        const identifier = document.getElementById('email-input').value;

        if (!identifier) {
            alert("Please enter email or mobile number");
            return;
        }

        try {
            // Send OTP based on the earlier check (isEmail)
            const route = isEmail ? 'http://localhost:3000/mail_otp/send-otp' : 'http://localhost:3000/otp/send-otp';
            const response = await fetch(route, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier })
            });
            console.log("befor await")
            const result = await response.json();
            console.log(result)
            if (response.ok) {
                // Show OTP container
                passwordContainer.classList.add('hidden');
                otpContainer.classList.remove('hidden');
                alert("OTP sent successfully");
            } else {
                alert(result.message || "Failed to send OTP");
            }
        } catch (error) {
            alert("Error sending OTP");
        }
    });

    // Event listener for OTP Login button (Verify OTP)
    otpLoginButton.addEventListener('click', async function () {
        const otp = document.getElementById('otp-input').value;
        const identifier = document.getElementById('email-input').value;

        if (!otp) {
            alert("Please enter the OTP");
            return;
        }

        try {
            // Verify OTP based on the earlier check (isEmail)
            const route = isEmail ? 'http://localhost:3000/mail_otp/verify-otp' : 'http://localhost:3000/otp/verify-otp';
            const response = await fetch(route, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, otp })
            });

            const result = await response.json();
            if (response.ok) {
                // Now log in the user using the same /signin route
                const loginResponse = await fetch('http://localhost:3000/landowner/signin_by_otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier })
                });

                const loginResult = await loginResponse.json();
                console.log(loginResult.token)
                if (loginResponse.ok) {
                    // Store JWT token
                    localStorage.setItem('jwt', loginResult.token);
                    alert("Logged in successfully");
                } else {
                    alert(loginResult.message || "Login failed");
                }
            } else {
                alert(result.message || "OTP verification failed");
            }
        } catch (error) {
            alert("Error verifying OTP");
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
                alert("OTP resent successfully");
            } else {
                alert("Failed to resend OTP");
            }
        } catch (error) {
            alert("Error resending OTP");
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
