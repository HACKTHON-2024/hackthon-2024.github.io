window.addEventListener('online', handleNetworkChange);
window.addEventListener('offline', handleNetworkChange);
async function onclickconfirm() {
    try {
        if (!navigator.onLine) {
            window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
            return;
        }else {
            checkServerStatus();
        }
        // Create an array of required validations
        // First check if all required elements exist
        const requiredElements = {
            'name': 'Full Name',
            'gender': 'Gender',
            'dob': 'Date of Birth',
            'aadhaar': 'Aadhaar Number',
            'mobile': 'Mobile Number',
            'email': 'Email',
            'address': 'Address',
            'state': 'State',
            'city': 'City',
            'taluk': 'Taluk',
            'password': 'Password',
            'confirm-password': 'Confirm Password',
            'skills': 'Job Skills'
        };

        // Check if all elements exist in the DOM
        for (const [elementId, fieldName] of Object.entries(requiredElements)) {
            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`Form element not found: ${fieldName} (ID: ${elementId})`);
            }
        }

        // Proceed with form validation
        const validations = [
            { name: 'Name', result: validateName() },
            { name: 'Gender', result: validateGender() },
            { name: 'Date of Birth', result: validateDOB() },
            { name: 'Aadhaar', result: validateAadhaar() },
            { name: 'Mobile', result: validateMobile() },
            { name: 'Email', result: validateEmail() },
            { name: 'Location', result: validateLocation() },
            { name: 'Password', result: validatePassword() },
            { name: 'Confirm Password', result: validateConfirmPassword() },
            { name: 'Alternate Mobile', result: validateAlternateMobile() }
        ];

        // Check if any validations failed
        const failedValidations = validations.filter(v => !v.result);
        
        if (failedValidations.length > 0) {
            const failedFields = failedValidations.map(v => v.name);
            showModal('Please Fix the Following Errors:', failedFields);
            return;
        }

        // Check terms acceptance
        const termsAccepted = document.querySelector('input[type="checkbox"]').checked;
        if (!termsAccepted) {
            showModal('Please Accept Terms and Conditions', []);
            return;
        }

        // Proceed with form submission if all validations pass
        const formData = {
            username: document.getElementById('name').value.trim(),
            gender: document.getElementById('gender').value,
            DOB: document.getElementById('dob').value,
            aadhaar_ID: document.getElementById('aadhaar').value.trim(),
            mobile_number: document.getElementById('mobile').value.trim(),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim(),
            state: document.getElementById('state').value,
            city: document.getElementById('city').value,
            taluk: document.getElementById('taluk').value,
            password: document.getElementById('password').value,
            job_skills: document.getElementById('skills').value.trim()
        };

        // Only add alternate_mobile_number if it has a value
        const altMobile = document.getElementById('alternate-phone')?.value?.trim();
        if (altMobile) {
            formData.alternate_mobile_number = altMobile;
        }

        // Log the form data for debugging
        console.log('Form Data:', formData);

        const response = await fetch('http://localhost:3000/labour/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        console.log(result);
        if (!response.ok) {
            showModal('Registration Failed', [result.message || 'Please try again later.']);
            return;
        }

        // Show success message
        showSuccessMessage('Registration Successful!', ['You will be redirected to the login page shortly...']);

        // Clear stored data
        localStorage.removeItem('formData');

    } catch (error) {
        console.error('Error:', error);
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.innerHTML = `
            <button id="error-message-close">&times;</button>
            <h3>Error</h3>
            <p>${error.message || 'An unexpected error occurred. Please try again.'}</p>
        `;
        errorMessageElement.classList.add('show');
        document.querySelector('.overlay').classList.add('show');
        
        document.getElementById('error-message-close').onclick = function() {
            errorMessageElement.classList.remove('show');
            document.querySelector('.overlay').classList.remove('show');
        };
        if (!navigator.onLine) {
            window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
            return;
        }else {
            checkServerStatus();
        }
    }
}

async function loadLocationData() {
    const response = await fetch('http://localhost:3000/frontend/static/india_data.json');
    const data = await response.json();
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');
    const talukSelect = document.getElementById('taluk');

    // Populate states
    data.states.forEach(state => {
        const option = document.createElement('option');
        option.value = state.name;
        option.textContent = state.name;
        stateSelect.appendChild(option);
    });

    // Populate cities based on selected state
    stateSelect.addEventListener('change', function() {
        citySelect.innerHTML = '<option value="">-- Select City --</option>';
        talukSelect.innerHTML = '<option value="">-- Select Taluk --</option>';
        
        const selectedState = data.states.find(state => state.name === stateSelect.value);
        if (selectedState) {
            selectedState.cities.forEach(city => {
                const cityOption = document.createElement('option');
                cityOption.value = city.name;
                cityOption.textContent = city.name;
                citySelect.appendChild(cityOption);
            });
        }
        validateLocation();
    });

    // Populate taluks based on selected city
    citySelect.addEventListener('change', function() {
        talukSelect.innerHTML = '<option value="">-- Select Taluk --</option>';

        const selectedState = data.states.find(state => state.name === stateSelect.value);
        const selectedCity = selectedState?.cities.find(city => city.name === citySelect.value);
        
        if (selectedCity) {
            selectedCity.taluks.forEach(taluk => {
                const talukOption = document.createElement('option');
                talukOption.value = taluk;
                talukOption.textContent = taluk;
                talukSelect.appendChild(talukOption);
            });
        }
        validateLocation();
    });

    // Add validation for taluk
    talukSelect.addEventListener('change', validateLocation);
}
document.addEventListener('DOMContentLoaded', loadLocationData);

function showError(inputElement, errorId, message) {
    if (!inputElement || !errorId) return;

    inputElement.style.borderColor = '#ff3333';
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.id = errorId;
        errorElement.className = 'error-text';
        // Insert error message after the input element
        inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function clearError(inputElement, errorId) {
    if (!inputElement || !errorId) return;

    inputElement.style.borderColor = '';
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function validateName() {
    const name = document.getElementById('name');
    if (!name) return false;
    
    if (!name.value.trim()) {
        showError(name, 'name-error', 'Name is required');
        return false;
    } else if (name.value.length < 2) {
        showError(name, 'name-error', 'Name must be at least 2 characters long');
        return false;
    } else if (!/^[a-zA-Z\s]*$/.test(name.value)) {
        showError(name, 'name-error', 'Name should only contain letters');
        return false;
    } else {
        clearError(name, 'name-error');
        return true;
    }
}

function validateGender() {
    const gender = document.getElementById('gender');
    const errorElement = document.getElementById('gender-error');
    
    if (!gender || !gender.value) {
        showError(gender, 'gender-error', 'Please select a gender');
        return false;
    } else {
        clearError(gender, 'gender-error');
        return true;
    }
}

function validateDOB() {
    const dob = document.getElementById('dob');
    const errorId = 'dob-error';
    
    const birthDate = new Date(dob.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (!dob.value) {
        showError(dob, errorId, 'Date of Birth is required');
        return false;
    } else if (age < 18) {
        showError(dob, errorId, 'You must be at least 18 years old');
        return false;
    } else if (birthDate > today) {
        showError(dob, errorId, 'Date of Birth cannot be in the future');
        return false;
    } else {
        clearError(dob, errorId);
        return true;
    }
}

function validateAadhaar() {
    const aadhaar = document.getElementById('aadhaar');
    const errorId = 'aadhaar-error';
    
    const aadhaarRegex = /^\d{12}$/;
    
    if (!aadhaar.value) {
        showError(aadhaar, errorId, 'Aadhaar number is required');
        return false;
    } else if (!aadhaarRegex.test(aadhaar.value)) {
        showError(aadhaar, errorId, 'Aadhaar number must be exactly 12 digits');
        return false;
    } else {
        clearError(aadhaar, errorId);
        return true;
    }
}

function validateMobile() {
    const mobile = document.getElementById('mobile');
    const errorId = 'mobile-error';
    
    const mobileRegex = /^[6-9]\d{9}$/;
    
    if (!mobile.value) {
        showError(mobile, errorId, 'Mobile number is required');
        return false;
    } else if (!mobileRegex.test(mobile.value)) {
        showError(mobile, errorId, 'Enter valid 10-digit mobile number starting with 6-9');
        return false;
    } else {
        clearError(mobile, errorId);
        return true;
    }
}

function validateAlternateMobile() {
    const altMobile = document.getElementById('alternate-phone');
    const mainMobile = document.getElementById('mobile');
    
    // If the alternate mobile field doesn't exist, return true as it's optional
    if (!altMobile) {
        return true;
    }

    const errorId = 'alternate-phone-error';
    const mobileRegex = /^[6-9]\d{9}$/;
    
    // If a value is provided, validate it
    if (altMobile.value.trim()) {
        // Validate only if a value is entered
        if (!mobileRegex.test(altMobile.value)) {
            showError(altMobile, errorId, 'Enter valid 10-digit mobile number starting with 6-9');
            return false;
        } 
        
        // Check if it's the same as primary number
        if (mainMobile && altMobile.value === mainMobile.value) {
            showError(altMobile, errorId, 'Alternate number should be different from primary number');
            return false;
        }
    }

    clearError(altMobile, errorId);
    return true;
}

function validateEmail() {
    const email = document.getElementById('email');
    const errorId = 'email-error';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Validate only if a value is entered
    if (email.value.trim()) {
        if (!emailRegex.test(email.value)) {
            showError(email, errorId, 'Please enter a valid email address');
            return false;
        } else {
            clearError(email, errorId);
            return true;
        }
    }

    // If no value is entered, clear any existing error
    clearError(email, errorId);
    return true; // Treat as valid if not provided
}




function validatePassword() {
    const password = document.getElementById('password');
    if (!password) return false;
    
    if (!password.value) {
        showError(password, 'password-error', 'Password is required');
        return false;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordRegex.test(password.value)) {
        showError(password, 'password-error', 
            'Password must contain at least 8 characters, including uppercase, lowercase, number and special character');
        return false;
    }
    
    clearError(password, 'password-error');
    return true;
}

function validateConfirmPassword() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    if (!confirmPassword || !password) return false;
    
    if (!confirmPassword.value) {
        showError(confirmPassword, 'confirm-password-error', 'Please confirm your password');
        return false;
    }
    
    if (password.value !== confirmPassword.value) {
        showError(confirmPassword, 'confirm-password-error', 'Passwords do not match');
        return false;
    }
    
    clearError(confirmPassword, 'confirm-password-error');
    return true;
}

// Add CSS for better error display
const style = document.createElement('style');
style.textContent = `
    .error-text {
        color: #ff3333;
        font-size: 12px;
        margin-top: 4px;
        display: none;
        font-family: Arial, sans-serif;
    }

    input:invalid,
    select:invalid,
    textarea:invalid {
        border-color: #ff3333;
    }

    .form-group {
        margin-bottom: 20px;
        position: relative;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #4CAF50;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
    }

    .form-group.error input,
    .form-group.error select,
    .form-group.error textarea {
        border-color: #ff3333;
    }

    #error-message {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff1f1;
        border: 2px solid #ff3333;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-width: 80%;
        width: auto;
        text-align: left;
        display: none;
    }

    #error-message.show {
        display: block;
    }

    #error-message h3 {
        color: #ff3333;
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 18px;
    }

    #error-message ul {
        margin: 0;
        padding-left: 20px;
        color: #666;
    }

    #error-message li {
        margin-bottom: 5px;
    }

    #error-message-close {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
    }

    #error-message-close:hover {
        color: #ff3333;
    }

    .location-fields {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
    }

    .location-field {
        position: relative;
        flex: 1;
    }

    .location-field select {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        transition: border-color 0.3s ease;
    }

    .location-field select:focus {
        outline: none;
        border-color: #4CAF50;
    }

    .location-field .error-text {
        position: absolute;
        bottom: -20px;
        left: 0;
        font-size: 12px;
        color: #ff3333;
    }

    .location-field select.error {
        border-color: #ff3333;
    }

    @media (max-width: 768px) {
        .location-fields {
            flex-direction: column;
            gap: 30px;
        }

        .location-field .error-text {
            bottom: -18px;
        }
    }

    #error-message {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-width: 400px;
        width: 90%;
        display: none;
        border: 2px solid #ff3333;
    }

    #error-message.show {
        display: block;
    }

    #error-message h3 {
        color: #ff3333;
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 18px;
    }

    #error-message ul {
        margin: 0;
        padding-left: 20px;
        color: #666;
    }

    #error-message li {
        margin-bottom: 5px;
    }

    #error-message-close {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
        padding: 0;
        line-height: 1;
    }

    #error-message-close:hover {
        color: #ff3333;
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        display: none;
    }

    .overlay.show {
        display: block;
    }
`;
document.head.appendChild(style);

// Update the event listeners
document.addEventListener('DOMContentLoaded', function() {
    const validationMap = {
        'name': { validate: validateName, errorId: 'name-error' },
        'gender': { validate: validateGender, errorId: 'gender-error' },
        'dob': { validate: validateDOB, errorId: 'dob-error' },
        'aadhaar': { validate: validateAadhaar, errorId: 'aadhaar-error' },
        'mobile': { validate: validateMobile, errorId: 'mobile-error' },
        'email': { validate: validateEmail, errorId: 'email-error' },
        'password': { validate: validatePassword, errorId: 'password-error' },
        'confirm-password': { validate: validateConfirmPassword, errorId: 'confirm-password-error' }
    };

    // Add event listeners for all inputs
    Object.entries(validationMap).forEach(([inputId, { validate }]) => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', validate);
            element.addEventListener('blur', validate);
        }
    });

    // Special handling for password fields
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');

    if (password && confirmPassword) {
        password.addEventListener('input', () => {
            validatePassword();
            if (confirmPassword.value) {
                validateConfirmPassword();
            }
        });

        confirmPassword.addEventListener('input', validateConfirmPassword);
    }

    // Add event listeners for location fields
    const state = document.getElementById('state');
    const city = document.getElementById('city');
    const taluk = document.getElementById('taluk');

    if (state) {
        state.addEventListener('change', function() {
            validateLocation();
        });
    }

    if (city) {
        city.addEventListener('change', function() {
            validateLocation();
        });
    }

    if (taluk) {
        taluk.addEventListener('change', function() {
            validateLocation();
        });
    }
});
// Add this to your existing script.js
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...

    // Add logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear the JWT token from localStorage
            localStorage.removeItem('jwt');
            
            // Redirect to home page
            window.location.href = 'http://localhost:5500/frontend/static/home_page/index.html';
        });
    }

    // Check authentication status on page load
    function checkAuth() {
        const token = localStorage.getItem('jwt');
    }

    // Call checkAuth when page loads
    checkAuth();
});

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

// Add this at the beginning of your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    const infoButton = document.querySelector('.floating-info');
    const infoModal = document.querySelector('.info-modal');
    const overlay = document.querySelector('.info-overlay');
    const closeButton = document.querySelector('.close-modal');

    function showModal() {
        infoModal.classList.add('active');
        overlay.classList.add('active');
    }

    function hideModal() {
        infoModal.classList.remove('active');
        overlay.classList.remove('active');
    }

    infoButton.addEventListener('click', showModal);
    closeButton.addEventListener('click', hideModal);
    overlay.addEventListener('click', hideModal);
});

// Function to handle network changes
function handleNetworkChange(event) {
    if (!navigator.onLine) {
        // Redirect to network error page when offline
        window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
    } else {
        const currentPath = window.location.pathname;
        if (currentPath.includes('network-error') || currentPath.includes('server-error')) {
            checkServerStatus().then(isServerRunning => {
                if (isServerRunning) {
                    window.history.back();
                }
            });
        }
    }
}

// Function to check if server is running
async function checkServerStatus() {
    try {
        const response = await fetch('http://localhost:3000/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(5000)
        });
        return true;
    } catch (error) {
        if (!window.location.pathname.includes('server-error.html')) {
            window.location.href = 'http://localhost:5500/frontend/static/server-error.html';
        }
        return false;
    }
}

// Add this function to your script.js
function validateLocation() {
    const state = document.getElementById('state');
    const city = document.getElementById('city');
    const taluk = document.getElementById('taluk');
    
    let isValid = true;
    
    // Validate State
    if (!state.value) {
        showError(state, 'state-error', 'Please select a state');
        isValid = false;
    } else {
        clearError(state, 'state-error');
    }
    
    // Validate City
    if (state.value && !city.value) {
        showError(city, 'city-error', 'Please select a city');
        isValid = false;
    } else {
        clearError(city, 'city-error');
    }
    
    // Validate Taluk
    if (city.value && !taluk.value) {
        showError(taluk, 'taluk-error', 'Please select a taluk');
        isValid = false;
    } else {
        clearError(taluk, 'taluk-error');
    }
    
    return isValid;
}

// Function to show modal with messages
function showModal(title, messages) {
    const modal = document.getElementById('error-message');
    const messageList = messages.map(msg => `<li>${msg}</li>`).join('');
    modal.innerHTML = `
        <button id="error-message-close">&times;</button>
        <h3>${title}</h3>
        <ul>${messageList}</ul>
    `;
    modal.classList.add('show');
    document.querySelector('.overlay').classList.add('show');

    // Close button functionality
    document.getElementById('error-message-close').onclick = function() {
        modal.classList.remove('show');
        document.querySelector('.overlay').classList.remove('show');
    };
}

function showSuccessMessage(title, messages) {
    const successModal = document.getElementById('success-message');
    const messageList = messages.map(msg => `<li>${msg}</li>`).join('');
    successModal.innerHTML = `
        <button id="success-message-close">&times;</button>
        <h3>${title}</h3>
        <ul>${messageList}</ul>
    `;
    
    successModal.classList.add('show');
    document.querySelector('.overlay').classList.add('show');

    // Close button functionality
    document.getElementById('success-message-close').onclick = function() {
        successModal.classList.remove('show');
        document.querySelector('.overlay').classList.remove('show');
    };
}

// Add this function to save form data to localStorage
function saveFormData() {
    const formData = {
        name: document.getElementById('name').value.trim(),
        gender: document.getElementById('gender').value,
        dob: document.getElementById('dob').value,
        aadhaar: document.getElementById('aadhaar').value.trim(),
        mobile: document.getElementById('mobile').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim(),
        state: document.getElementById('state').value,
        city: document.getElementById('city').value,
        taluk: document.getElementById('taluk').value,
        password: document.getElementById('password').value,
        skills: document.getElementById('skills').value.trim(),
        alternatePhone: document.getElementById('alternate-phone')?.value?.trim(),
    };
    localStorage.setItem('formData', JSON.stringify(formData));
}

// Add event listeners to save data on input
document.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', saveFormData);
});

// Load form data from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedData = JSON.parse(localStorage.getItem('formData'));
    if (savedData) {
        document.getElementById('name').value = savedData.name || '';
        document.getElementById('gender').value = savedData.gender || '';
        document.getElementById('dob').value = savedData.dob || '';
        document.getElementById('aadhaar').value = savedData.aadhaar || '';
        document.getElementById('mobile').value = savedData.mobile || '';
        document.getElementById('alternate-phone').value = savedData.alternatePhone || '';
        document.getElementById('email').value = savedData.email || '';
        document.getElementById('address').value = savedData.address || '';
        document.getElementById('state').value = savedData.state || '';
        document.getElementById('city').value = savedData.city || '';
        document.getElementById('taluk').value = savedData.taluk || '';
        document.getElementById('skills').value = savedData.skills || '';
        document.getElementById('password').value = savedData.password || '';
    }
});
