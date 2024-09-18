function toggleEdit() {
    const fields = ['name', 'gender', 'DOB', 'phone', 'alt-phone', 'aadhaar', 'email', 'address', 'job', 'password'];

    fields.forEach(field => {
        document.getElementById(`${field}Display`).style.display = 'none';
        document.getElementById(`${field}Input`).style.display = 'inline';
    });

    document.getElementById('editButton').style.display = 'none';
    document.getElementById('saveButton').style.display = 'inline';
}

function saveChanges() {
    var fields = {
        name: document.getElementById('nameInput').value,
        gender: document.getElementById('genderInput').value,
        DOB: document.getElementById('DOBInput').value,
        phone: document.getElementById('phoneInput').value,
        altPhone: document.getElementById('alt-phoneInput').value,
        aadhaar: document.getElementById('aadhaarInput').value,
        email: document.getElementById('emailInput').value,
        address: document.getElementById('addressInput').value,
        job: document.getElementById('jobInput').value,
        password: document.getElementById('passwordInput').value
    };

    // Display updated values
    for (const [key, value] of Object.entries(fields)) {
        if (key === 'password') {
            document.getElementById('passwordDisplay').innerText = '********'; // Always display as '********'
        } else {
            document.getElementById(`${key}Display`).innerText = value;
        }
    }

    toggleDisplayMode();
}

function toggleDisplayMode() {
    const fields = ['name', 'gender', 'DOB', 'phone', 'alt-phone', 'aadhaar', 'email', 'address', 'job', 'password'];

    fields.forEach(field => {
        document.getElementById(`${field}Display`).style.display = document.getElementById(`${field}Input`).style.display === 'none' ? 'inline' : 'none';
        document.getElementById(`${field}Input`).style.display = document.getElementById(`${field}Input`).style.display === 'none' ? 'inline' : 'none';
    });

    document.getElementById('editButton').style.display = document.getElementById('editButton').style.display === 'none' ? 'inline' : 'none';
    document.getElementById('saveButton').style.display = document.getElementById('saveButton').style.display === 'none' ? 'inline' : 'none';
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('passwordInput');
    const passwordEye = document.getElementById('passwordEye');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordEye.src = './Images/3.png'; // Path to open eye icon
    } else {
        passwordInput.type = 'password';
        passwordEye.src = './Images/4.png'; // Path to closed eye icon
    }
}


function toggleJobDetails(element) {
    const jobDetails = element.nextElementSibling;
    const arrow = element.querySelector('.arrow');

    if (jobDetails.style.display === 'block') {
        jobDetails.style.display = 'none';
        arrow.textContent = '▼'; // Show down arrow
    } else {
        jobDetails.style.display = 'block';
        arrow.textContent = '▲'; // Show up arrow
    }
}

function makeEditable(button) {
    const jobDetails = button.parentElement;
    const allEditableBoxes = jobDetails.querySelectorAll('.editable-box');

    allEditableBoxes.forEach(box => {
        const span = box.querySelector('span');
        const currentText = span.textContent;

        // Create an input field with the current text value
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;

        // Replace the span with the input field
        box.replaceChild(input, span);
    });

    // Change the Edit button to Save
    button.textContent = 'Save';
    button.onclick = function () {
        saveChanges(button);
    };
}

function saveChanges(button) {
    const jobDetails = button.parentElement;
    const allInputBoxes = jobDetails.querySelectorAll('.editable-box input');

    allInputBoxes.forEach(input => {
        const updatedText = input.value;

        // Create a span with the updated text
        const span = document.createElement('span');
        span.textContent = updatedText;

        // Replace the input field with the span
        input.parentElement.replaceChild(span, input);
    });

    // Change the Save button back to Edit
    button.textContent = 'Edit';
    button.onclick = function () {
        makeEditable(button);
    };
}