document.addEventListener("DOMContentLoaded", function() {
   
    

    // Fetch active jobs when the page loads
    fetchActiveJobs();
});

 // Function to fetch active jobs from the server
// Fetch labour data from API
function fetchLabours() {
    fetch('http://localhost:3000/landowner//active_jobs')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayLabours(data.data); // Display the labours dynamically
            } else {
                console.error('Error fetching labours:', data.message);
            }
        })
        .catch(error => {
            console.error('Error during labour fetch:', error);
        });
}

// Dynamically display labours
function displayLabours(active_jobs) {
    const active_job_List = document.getElementById('active-job-list');
    active_jobs_List.innerHTML = ''; // Clear existing labour cards

    if (active_jobs.length === 0) {
        active_jobs_List.innerHTML = '<p>No active jobs avaliable</p>';
        return;
    }

    labours.forEach(labour => {
        const active_jobs_Card = document.createElement('div');
        active_jobs_Card.classList.add('active-job-card');

        active_jobs_Card.innerHTML = `
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
                <p><strong>NAME:</strong> ${labour.title}</p>
                <p><strong>GENDER:</strong> ${labour.gender}</p>
                <p><strong>SKILL:</strong> ${skills}</p>
            </div>
            <div class="location">
                <p><strong>Location:</strong> ${labour.location}, ${labour.taluk}</p>
                <button class="request-btn" data-labour-id="${labour._id}">REQUEST</button>
            </div>
        `;

        active_jobs_List.appendChild(active_jobs_Card);
    });