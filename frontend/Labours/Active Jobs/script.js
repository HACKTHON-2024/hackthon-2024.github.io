document.addEventListener('DOMContentLoaded', async function () {
    const labourList = document.querySelector('.labour-list');

    // Fetch active jobs from the server
    async function fetchActiveJobs() {
        try {
            const response = await fetch('http://localhost:3000/labour/active_jobs');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const activeJobs = await response.json();
          
            // Check if activeJobs is an array and display them
            if (Array.isArray(activeJobs) && activeJobs.length > 0) {
                activeJobs.forEach(createJobCard);
            } else {
                labourList.innerHTML = '<p>No active jobs available</p>';
            }
        } catch (error) {
            console.error('Error fetching active jobs:', error);
            labourList.innerHTML = `<p>Error fetching active jobs: ${error.message}</p>`;
        }
    }

    // Function to create and display job cards dynamically
    function createJobCard(job) {
        const jobCard = document.createElement('div');
        jobCard.classList.add('labour-card');

        jobCard.innerHTML = `
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
                <p><strong>Title:</strong> ${job.title}</p>
                <p><strong>Description:</strong> ${job.description}</p>
                <p><strong>Amount:</strong> ₹${job.amount}</p>
                <p><strong>Start Date:</strong> ${new Date(job.start_date).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> ${new Date(job.end_date).toLocaleDateString()}</p>
            </div>
            <div class="location">
                <p><strong>Location:</strong> ${job.taluk}, ${job.city}</p>
            </div>
        `;

        labourList.appendChild(jobCard);
    }

    // Fetch and display active jobs when the page loads
    fetchActiveJobs();
});
