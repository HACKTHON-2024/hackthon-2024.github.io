async function onclickconfirm() {
    try {
        const formData = {
            username: document.getElementById('name').value,
            gender: document.getElementById('gender').value,
            DOB: document.getElementById('dob').value,
            aadhaar_ID: document.getElementById('aadhaar').value,
            mobile_number: document.getElementById('mobile').value,
            alternate_mobile_number: document.getElementById('alternate-phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            land_location: document.getElementById('land-location').value,
            land_size: document.getElementById('land-size').value,
            state: document.getElementById('state').value,
            city: document.getElementById('city').value,
            taluk: document.getElementById('taluk').value,
            land_type: document.getElementById('land-type').value,
            password: document.getElementById('password').value,
        };

        // Make an asynchronous API call using fetch
        const response = await fetch('http://localhost:3000/landowner/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        // Handle the response from the server
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                console.error('Error parsing response:', e);
                throw new Error('Failed to parse server error response');
            }

            if (errorData && errorData.errors) {
                console.error('Server validation errors:', errorData.errors);
                const errorMessageElement = document.getElementById('error-message');
                errorMessageElement.innerHTML = 'Validation errors:<br>' +
                    errorData.errors.map(e => `<strong>${e.field}:</strong> ${e.message}`).join('<br>');
            } else {
                console.error('Unexpected error format:', errorData);
                throw new Error('Unexpected error format from the server');
            }

            return; // Stop further execution
        }

        const result = await response.json();
        console.log('Form submitted successfully:', result);

        // Show success message to the user
        alert('Form submitted successfully!');
    } catch (error) {
        console.error('Error:', error);
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = 'There was an error submitting the form. Please try again.';
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
    });
}
document.addEventListener('DOMContentLoaded', loadLocationData);

function validateName() {
    const name = document.getElementById('name');
    const errorElement = document.getElementById('name-error');
    
    if (name.value.length < 2) {
        showError(name, errorElement, 'Name must be at least 2 characters long');
    } else if (!/^[a-zA-Z\s]*$/.test(name.value)) {
        showError(name, errorElement, 'Name should only contain letters');
    } else {
        clearError(name, errorElement);
    }
}

function validateGender() {
    const gender = document.getElementById('gender');
    const errorId = 'gender-error';
    
    if (!gender.value) {
        showError(gender, errorId, 'Gender is required');
        return false;
    } else if (!['male', 'female', 'other'].includes(gender.value.toLowerCase())) {
        showError(gender, errorId, 'Please enter Male, Female, or Other');
        return false;
    } else {
        clearError(gender, errorId);
        return true;
    }
}

function showError(inputElement, errorId, message) {
    inputElement.style.borderColor = '#ff3333';
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.id = errorId;
        errorElement.className = 'error-text';
        inputElement.insertAdjacentElement('afterend', errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function clearError(inputElement, errorId) {
    inputElement.style.borderColor = '';
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
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
    const errorId = 'alternate-phone-error';
    
    const mobileRegex = /^[6-9]\d{9}$/;
    
    if (altMobile.value) {  // Optional field
        if (!mobileRegex.test(altMobile.value)) {
            showError(altMobile, errorId, 'Enter valid 10-digit mobile number starting with 6-9');
            return false;
        } else if (altMobile.value === mainMobile.value) {
            showError(altMobile, errorId, 'Alternate number should be different from primary number');
            return false;
        } else {
            clearError(altMobile, errorId);
            return true;
        }
    } else {
        clearError(altMobile, errorId);
        return true;
    }
}

function validateEmail() {
    const email = document.getElementById('email');
    const errorId = 'email-error';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.value) {
        showError(email, errorId, 'Email is required');
        return false;
    } else if (!emailRegex.test(email.value)) {
        showError(email, errorId, 'Please enter a valid email address');
        return false;
    } else {
        clearError(email, errorId);
        return true;
    }
}

function validateLandSize() {
    const landSize = document.getElementById('land-size');
    const errorElement = document.getElementById('land-size-error');
    
    const sizeRegex = /^\d+(\.\d{1,2})?$/;
    
    if (!landSize.value) {
        showError(landSize, errorElement, 'Land size is required');
    } else if (!sizeRegex.test(landSize.value)) {
        showError(landSize, errorElement, 'Enter valid land size (up to 2 decimal places)');
    } else if (parseFloat(landSize.value) <= 0) {
        showError(landSize, errorElement, 'Land size must be greater than 0');
    } else {
        clearError(landSize, errorElement);
    }
}

function validateLocation() {
    const state = document.getElementById('state');
    const city = document.getElementById('city');
    const taluk = document.getElementById('taluk');
    
    const stateError = document.getElementById('state-error');
    const cityError = document.getElementById('city-error');
    const talukError = document.getElementById('taluk-error');
    
    if (!state.value) {
        showError(state, stateError, 'Please select a state');
    } else {
        clearError(state, stateError);
    }
    
    if (!city.value) {
        showError(city, cityError, 'Please select a city');
    } else {
        clearError(city, cityError);
    }
    
    if (!taluk.value) {
        showError(taluk, talukError, 'Please select a taluk');
    } else {
        clearError(taluk, talukError);
    }
}

function validateLandType() {
    const landType = document.getElementById('land-type');
    const errorElement = document.getElementById('land-type-error');
    
    if (!landType.value) {
        showError(landType, errorElement, 'Please select land type');
    } else {
        clearError(landType, errorElement);
    }
}

function validatePassword() {
    const password = document.getElementById('password');
    const errorId = 'password-error';
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!password.value) {
        showError(password, errorId, 'Password is required');
        return false;
    } else if (!passwordRegex.test(password.value)) {
        showError(password, errorId, 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character');
        return false;
    } else {
        clearError(password, errorId);
        return true;
    }
}

// Update the event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add input event listeners for real-time validation
    const validationMap = {
        'name': validateName,
        'gender': validateGender,
        'dob': validateDOB,
        'aadhaar': validateAadhaar,
        'mobile': validateMobile,
        'alternate-phone': validateAlternateMobile,
        'email': validateEmail,
        'state': validateLocation,
        'city': validateLocation,
        'taluk': validateLocation,
        'password': validatePassword
    };

    // Add event listeners for all inputs
    Object.keys(validationMap).forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            const eventType = ['state', 'city', 'taluk'].includes(inputId) ? 'change' : 'input';
            element.addEventListener(eventType, validationMap[inputId]);
        }
    });

    const gender = document.getElementById('gender');
    if (gender) {
        gender.addEventListener('input', validateGender);
        // Also validate on blur to catch paste events
        gender.addEventListener('blur', validateGender);
    }
});

// Add CSS styles programmatically
const style = document.createElement('style');
style.textContent = `
    .error-text {
        color: #ff3333;
        font-size: 12px;
        margin-top: 4px;
        display: block;
        font-family: Arial, sans-serif;
        margin-bottom: 10px;
    }

    input.error {
        border-color: #ff3333 !important;
    }
`;
document.head.appendChild(style);
