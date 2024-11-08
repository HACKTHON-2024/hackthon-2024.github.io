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
            state: document.getElementById('state').value,
            city: document.getElementById('city').value,
            taluk: document.getElementById('taluk').value,
            password: document.getElementById('password').value,
            job_skills:document.getElementById('job-skills').value

        };

        // Make an asynchronous API call using fetch
        const response = await fetch('http://localhost:3000/labour/signup', {
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
