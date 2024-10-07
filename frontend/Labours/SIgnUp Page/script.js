// async function onclickconfirm() {
//     try {
//         const formData = {
//             username: document.getElementById('name').value,
//             gender: document.getElementById('gender').value,
//             DOB: document.getElementById('dob').value,
//             aadhaar_ID: document.getElementById('aadhaar').value,
//             mobile_number: document.getElementById('mobile').value,
//             alternate_mobile_number: document.getElementById('alternate-phone').value,
//             email: document.getElementById('email').value,
//             address: document.getElementById('address').value,
//             land_location: document.getElementById('land-location').value,
//             land_size: document.getElementById('land-size').value,
//             state: document.getElementById('land-state').value,
//             city: document.getElementById('land-city').value,
//             taluk: document.getElementById('land-taluk').value,
//             land_type: document.getElementById('land-type').value,
//             password: document.getElementById('password').value,
//         };

//         // Make an asynchronous API call using fetch
//         const response = await fetch('http://localhost:3000/landowner/signup', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(formData),
//         });

//         // Handle the response from the server
//         if (!response.ok) {
//             // Safely parse the error data
//             let errorData;
//             try {
//                 errorData = await response.json();
//             } catch (e) {
//                 console.error('Error parsing response:', e);
//                 throw new Error('Failed to parse server error response');
//             }

//             // Check if the errors array exists before trying to map over it
//             if (errorData && errorData.errors) {
//                 console.error('Server validation errors:', errorData.errors);
//                 const errorMessageElement = document.getElementById('error-message');
//                 errorMessageElement.innerHTML = 'Validation errors:<br>' + 
//                     errorData.errors.map(e => `<strong>${e.field}:</strong> ${e.message}`).join('<br>');
//             } else {
//                 console.error('Unexpected error format:', errorData);
//                 throw new Error('Unexpected error format from the server');
//             }

//             return; // Stop further execution
//         }

//         const result = await response.json();
//         console.log('Form submitted successfully:', result);

//         // Show success message to the user
//         alert('Form submitted successfully!');
//     } catch (error) {
//         // Handle network errors or unexpected issues
//         console.error('Error:', error);
//         const errorMessageElement = document.getElementById('error-message');
//         errorMessageElement.textContent = 'There was an error submitting the form. Please try again.';
//     }
// }

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
            state: document.getElementById('land-state').value,
            city: document.getElementById('land-city').value,
            taluk: document.getElementById('land-taluk').value,
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
