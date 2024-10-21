document.addEventListener('DOMContentLoaded', function () {
    feather.replace();

    // Handle the form submission
    const createJobButton = document.querySelector('.create-job-btn');
    createJobButton.addEventListener('click', async function (e) {
        e.preventDefault();

        // Collect form data
        const jobTitle = document.getElementById('job-title').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const handsNeed = document.getElementById('hands-need').value;
        const jobDescription = document.getElementById('job-description').value;
        const jobLocation = document.getElementById('job-location').value;
        const payment = document.getElementById('payment').value;

        const payload = {
            title: jobTitle,
            start_date: startDate,
            end_date: endDate,
            number_of_workers: handsNeed,
            description: jobDescription,
            location: jobLocation,
            amount: payment
        };

        try {
            const token = getToken();  // Get JWT token
            // Send data to the server
            const response = await fetch('http://localhost:3000/landowner/createjob', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header

                },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();

            if (response.ok) {
                alert('Job created successfully');
                console.log('Job:', result.job);
            } else {
                alert('Error creating job: ' + result.message);
                console.error('Validation Errors:', result.errors);
            }
        } catch (error) {
            alert('An error occurred while creating the job');
            console.error('Error:', error);
        }
    });
});


function getToken() {
    return localStorage.getItem('jwt');  // Retrieve JWT token from localStorage
}
