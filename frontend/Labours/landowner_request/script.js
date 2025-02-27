document.addEventListener('DOMContentLoaded', function() {
    sessionStorage.setItem('lastVisitedPage', window.location.href);
    fetchRequests();
});

// Function to handle network changes
function handleNetworkChange(event) {
    if (!navigator.onLine) {
        // Redirect to network error page when offline
        window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/network-error.html';
    } else {
        // When back online, check server status
        checkServerStatus();
    }
}

// Function to check if the server is running
async function checkServerStatus() {
    try {
        const response = await fetch('https://labourfieldtest.onrender.com', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(5000) // Set a timeout for the request
        });
        // If the server is reachable, redirect to the last visited page
        const lastVisitedPage = sessionStorage.getItem('lastVisitedPage');
        if (lastVisitedPage) {
            window.location.href = lastVisitedPage; // Redirect back to the last visited page
        }
    } catch (error) {
        console.error('Server is still down:', error);
        // Optionally, you can show a message or keep the user on the current page
    }
}

// Add event listeners for network status changes
window.addEventListener('online', handleNetworkChange);
window.addEventListener('offline', handleNetworkChange);

async function fetchRequests() {
    try {
        const token = localStorage.getItem('jwt');
      
        if (!token) {
            window.location.href = '../../static/home_page/index.html';
            return;
        }

        const response = await fetch('https://labourfieldtest.onrender.com/labour/landowner_request_details', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
       
        if (!response.ok) {
            // Handle server errors
            if (response.status === 404) {
                window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/404/index.html'; // Redirect to 404 page
            } else {
                window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/server-error.html'; // Redirect to server error page
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        //console.log('Fetched data:', result); // For debugging

        if (!result.data || !Array.isArray(result.data)) {
            throw new Error('Invalid data format received');
        }

        if (result.data.length === 0) {
            displayNoRequests();
            return;
        }

        displayRequests(result.data);
    } catch (error) {
        console.error('Error:', error);
        displayError('Failed to load requests. Please try again later.');
    }
}

function displayRequests(requests) {
    const container = document.getElementById('request-list-container');
    container.innerHTML = '';

    requests.forEach(request => {
        const jobDetails = request.job_id || {};
        const landownerDetails = jobDetails.created_by || {};
        const status = request.status || null;

        const requestCard = document.createElement('div');
        requestCard.className = 'request-card';

        // Different button/status display based on request status
        let actionButtons = '';
        let statusDisplay = '';

        // Use Font Awesome icons for accepted and rejected statuses
        if (status === 'ACCEPTED') {
            statusDisplay = `
                <span class="status-badge accepted">
                    <i class="fas fa-check-circle status-icon"></i> Accepted
                </span>`;
        } else if (status === 'REJECTED') {
            statusDisplay = `
                <span class="status-badge rejected">
                    <i class="fas fa-times-circle status-icon"></i> Rejected
                </span>`;
        } else {
            actionButtons = `
                <div class="request-actions">
                    <button onclick="handleRequest('${request._id}', 'ACCEPTED')" class="accept-btn">
                        <i class="fas fa-check"></i> Accept
                    </button>
                    <button onclick="handleRequest('${request._id}', 'REJECTED')" class="reject-btn">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>`;
        }

        requestCard.innerHTML = `
            <div class="request-header">
                <div class="job-title">
                    <h3>${jobDetails.title || 'Untitled Job'}</h3>
                    <span class="request-date">${formatDate(request.date)}</span>
                </div>
                ${statusDisplay}
            </div>
            ${actionButtons}
            <div class="request-details">
                <div class="landowner-info">
                    <h4>Landowner Details:</h4>
                    <p><i class="fas fa-user"></i> ${landownerDetails.username || 'N/A'}</p>
                    <p><i class="fas fa-phone"></i> ${landownerDetails.mobile_number || 'N/A'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${landownerDetails.address || 'N/A'}</p>
                </div>
                <div class="job-info">
                    <h4>Job Details:</h4>
                    <p><i class="fas fa-rupee-sign"></i> Daily Wage: ₹${jobDetails.amount || 'N/A'}</p>
                    <p><i class="fas fa-calendar"></i> Duration: ${formatDate(jobDetails.start_date)} to ${formatDate(jobDetails.end_date)}</p>
                    <p><i class="fas fa-users"></i> Required Workers: ${jobDetails.number_of_workers || 'N/A'}</p>
                    ${jobDetails.description ? `<p><i class="fas fa-info-circle"></i> Description: ${jobDetails.description}</p>` : ''}
                </div>
            </div>
        `;
        container.appendChild(requestCard);
    });
}

function displayNoRequests() {
    const container = document.getElementById('request-list-container');
    container.innerHTML = `
        <div class="no-requests">
            <i class="fas fa-inbox"></i>
            <p>No requests found</p>
        </div>
    `;
}

function displayError(message) {
    const container = document.getElementById('request-list-container');
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

async function handleRequest(requestId, action) {
    try {
        const isConfirmed = confirm(`Are you sure you want to ${action.toLowerCase()} this job request?`);
        if (!isConfirmed) return;

        const token = localStorage.getItem('jwt');
        if (!token) {
            alert('Please login again');
            window.location.href = '../../static/login_page/index.html';
            return;
        }

        const response = await fetch('https://labourfieldtest.onrender.com/labour/handle_request', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                request_id: requestId,
                action: action
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update request status');
        }

        const result = await response.json();

        // Show success message
        if (action === 'ACCEPTED') {
            alert('You have successfully accepted the job request.');
        } else {
            alert('You have rejected the job request.');
        }

        // Refresh the requests list to show updated status
        await fetchRequests();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update request status. Please try again.');
    }
}
