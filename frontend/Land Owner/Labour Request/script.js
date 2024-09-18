// Initialize the datepicker
document.addEventListener('DOMContentLoaded', function () {
    const datepicker = document.getElementById('datepicker');
    datepicker.addEventListener('focus', function () {
        datepicker.type = 'date';
    });

    datepicker.addEventListener('blur', function () {
        if (!datepicker.value) {
            datepicker.type = 'text';
        }
    });

    // Fetch labor data from the API when the page loads
    fetchLabours();
});

// Function to fetch labour data from the API and display it
function fetchLabours() {
    fetch('http://localhost:3000/landowner/available_labours')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayLabours(data.data);
            } else {
                console.error('Error fetching labours:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Function to display the fetched labours dynamically
function displayLabours(labours) {
    const labourList = document.getElementById('labour-list');
    labourList.innerHTML = '';  // Clear any existing labour cards

    labours.forEach(labour => {
        const labourCard = document.createElement('div');
        labourCard.classList.add('labour-card');

        labourCard.innerHTML = `
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
                <p><strong>NAME:</strong> ${labour.name}</p>
                <p><strong>GENDER:</strong> ${labour.gender}</p>
                <p><strong>SKILL:</strong> ${labour.skills.join(', ')}</p>
            </div>
            <div class="location">
                <p><strong>Location:</strong> ${labour.city}, ${labour.taluk}</p>
                <button class="request-btn">REQUEST</button>
            </div>
        `;

        labourList.appendChild(labourCard);
    });
}
